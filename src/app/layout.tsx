import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FollowProvider } from '@/contexts/FollowContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SavedProvider } from '@/contexts/SavedContext';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'nuevo',
  description: 'AI 창작물 공유 플랫폼',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-white text-gray-900 antialiased">
        <AuthProvider>
          <NotificationProvider>
            <SavedProvider>
              <FollowProvider>{children}</FollowProvider>
            </SavedProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
