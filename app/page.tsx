'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/hero/HeroSection'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-[#050810] flex items-center justify-center">
      <div className="text-slate-400 text-sm tracking-widest uppercase animate-pulse">
        Loading experience&hellip;
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <HeroSection />
    </main>
  );
}
