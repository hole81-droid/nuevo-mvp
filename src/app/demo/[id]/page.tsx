import { notFound } from 'next/navigation';
import MemeGenerator from './MemeGenerator';
import CatPhilosopher from './CatPhilosopher';
import PastLifeJob from './PastLifeJob';
import PoemGenerator from './PoemGenerator';
import EmotionComfort from './EmotionComfort';
import SubwayFantasy from './SubwayFantasy';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DemoPage({ params }: Props) {
  const { id } = await params;
  if (id === '1') return <MemeGenerator />;
  if (id === '4') return <CatPhilosopher />;
  if (id === '6') return <PastLifeJob />;
  if (id === '7') return <PoemGenerator />;
  if (id === '8') return <EmotionComfort />;
  if (id === '9') return <SubwayFantasy />;
  notFound();
}
