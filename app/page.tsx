'use client';

import { Header } from '@/components/common/Header';
import { Board } from '@/components/board/Board';

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden p-2 md:p-6">
          <Board />
        </div>
      </main>
    </div>
  );
}
