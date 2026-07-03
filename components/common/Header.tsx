'use client';

import { useRealtimeStatus } from '@/lib/hooks/useRealtimeStatus';

export function Header() {
  const { isConnected } = useRealtimeStatus();

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              모바일DX
            </h1>
            <p className="text-xs text-slate-400">실시간 협업 칸반 보드</p>
          </div>
        </div>
        <div className="text-xs text-slate-300 flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-red-500'
            }`}
          ></span>
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>
    </header>
  );
}
