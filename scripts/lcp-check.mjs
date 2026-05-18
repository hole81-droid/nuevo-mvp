import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chromePath =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const nextCliPath = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const appPort = Number(process.env.LCP_APP_PORT || 3000);
const chromePort = Number(process.env.LCP_CHROME_PORT || 9222);
const baseUrl = `http://127.0.0.1:${appPort}`;
const targets = [
  '/post/1',
  '/post/1?autoplay=true',
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, timeoutMs = 20000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

function normalizeEnv(env = process.env) {
  const normalized = {};
  const seen = new Set();
  for (const [key, value] of Object.entries(env)) {
    if (!key || key.startsWith('=')) continue;
    const lowerKey = key.toLowerCase();
    if (seen.has(lowerKey)) continue;
    seen.add(lowerKey);
    normalized[key] = value;
  }
  return normalized;
}

function spawnProcess(command, args, options = {}) {
  let stderr = '';
  const child = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
    ...options,
    env: normalizeEnv(options.env),
  });

  child.stdout.on('data', () => {});
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    if (stderr.length > 4000) stderr = stderr.slice(-4000);
  });
  child.recentStderr = () => stderr.trim();
  return child;
}

async function connectToPage(chromeBaseUrl, url) {
  await fetch(`${chromeBaseUrl}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const pages = await (await fetch(`${chromeBaseUrl}/json/list`)).json();
  const page = pages.find((entry) => entry.type === 'page' && entry.url === url) ??
    pages.find((entry) => entry.type === 'page');

  if (!page?.webSocketDebuggerUrl) {
    throw new Error('Could not find a debuggable Chrome page');
  }

  return new CdpClient(page.webSocketDebuggerUrl);
}

class CdpClient {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.socket = new WebSocket(wsUrl);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result ?? {});
        return;
      }
      if (message.method) this.events.push(message);
    });
    this.socket.addEventListener('close', () => {
      for (const { reject } of this.pending.values()) {
        reject(new Error('Chrome DevTools socket closed'));
      }
      this.pending.clear();
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const promise = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(JSON.stringify({ id, method, params }));
    return promise;
  }

  async waitForEvent(method, timeoutMs = 15000) {
    const existing = this.events.find((event) => event.method === method);
    if (existing) return existing;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const onMessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.method === method) {
          cleanup();
          resolve(message);
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.socket.removeEventListener('message', onMessage);
      };

      this.socket.addEventListener('message', onMessage);
    });
  }

  close() {
    this.socket.close();
  }
}

async function measurePath(chromeBaseUrl, path) {
  const url = `${baseUrl}${path}`;
  const client = await connectToPage(chromeBaseUrl, 'about:blank');
  const failedRequests = [];
  const exceptions = [];

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Network.enable');
  await client.send('Performance.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  await client.send('Emulation.setUserAgentOverride', {
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  await client.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__lcpEntries = [];
      new PerformanceObserver((list) => {
        window.__lcpEntries.push(...list.getEntries().map((entry) => ({
          startTime: entry.startTime,
          size: entry.size,
          element: entry.element ? entry.element.tagName : null,
          url: entry.url || null
        })));
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    `,
  });

  const start = Date.now();
  const networkListener = (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Network.loadingFailed') {
      failedRequests.push(message.params);
    }
    if (message.method === 'Runtime.exceptionThrown') {
      exceptions.push(message.params.exceptionDetails?.text ?? 'Runtime exception');
    }
  };

  await client.ready;
  client.socket.addEventListener('message', networkListener);
  await client.send('Page.navigate', { url });
  for (let attempt = 0; attempt < 80; attempt++) {
    const readyState = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: 'document.readyState',
    });
    if (readyState.result.value === 'complete' || readyState.result.value === 'interactive') break;
    await delay(250);
  }
  await delay(3500);

  const result = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const lcp = window.__lcpEntries.at(-1) || performance.getEntriesByType('largest-contentful-paint').at(-1) || null;
      const frames = [...document.querySelectorAll('iframe')].map((frame) => ({
        src: frame.getAttribute('src'),
        loaded: !!frame.contentWindow
      }));
      return {
        path: location.pathname + location.search,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 500),
        lcpMs: lcp ? Math.round(lcp.startTime) : null,
        lcpSize: lcp?.size ?? null,
        lcpElement: lcp?.element ?? null,
        requestToLoadMs: Math.round(performance.now()),
        domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadEventMs: nav ? Math.round(nav.loadEventEnd) : null,
        iframeCount: frames.length,
        frames
      };
    })()`,
  });

  client.socket.removeEventListener('message', networkListener);
  client.close();

  return {
    ...result.result.value,
    wallMs: Date.now() - start,
    failedRequestCount: failedRequests.length,
    exceptions,
  };
}

async function main() {
  if (process.env.LCP_DEBUG === '1') console.error('lcp-check:start');
  const profileDir = await mkdtemp(join(tmpdir(), 'nuevo-lcp-chrome-'));
  const app = process.env.LCP_EXTERNAL_SERVER === '1'
    ? null
    : spawnProcess(process.execPath, [nextCliPath, 'start', '--hostname', '127.0.0.1', '--port', String(appPort)], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'local-lcp-placeholder',
      },
    });
  const chromeArgs = [
    process.env.LCP_HEADLESS_MODE === 'old' ? '--headless=old' : '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${profileDir}`,
    '--disable-gpu',
    '--disable-gpu-compositing',
    '--disable-accelerated-2d-canvas',
    '--use-gl=swiftshader',
    '--disable-features=VizDisplayCompositor',
    '--no-proxy-server',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=390,844',
    'about:blank',
  ];
  if (process.env.LCP_SINGLE_PROCESS === '1') {
    chromeArgs.splice(chromeArgs.length - 1, 0, '--single-process');
  }
  const chrome = spawnProcess(chromePath, chromeArgs);

  try {
    await waitForHttp(`${baseUrl}/`, 30000);
    if (process.env.LCP_DEBUG === '1') console.error('lcp-check:app-ready');
    const chromeBaseUrl = `http://127.0.0.1:${chromePort}`;
    try {
      await waitForHttp(`${chromeBaseUrl}/json/version`, 30000);
    } catch (error) {
      throw new Error(`Chrome remote debugging did not start: ${chrome.recentStderr() || error.message}`);
    }

    const results = [];
    for (const target of targets) {
      if (process.env.LCP_DEBUG === '1') console.error(`lcp-check:measure:${target}`);
      results.push(await measurePath(chromeBaseUrl, target));
    }

    const payload = JSON.stringify({ viewport: '390x844 DPR3 mobile', results }, null, 2);
    if (process.env.LCP_DEBUG === '1') console.error('lcp-check:write-result');
    if (process.env.LCP_OUTPUT) await writeFile(process.env.LCP_OUTPUT, `${payload}\n`);
    console.log(payload);
  } finally {
    app?.kill();
    chrome.kill();
    await rm(profileDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
