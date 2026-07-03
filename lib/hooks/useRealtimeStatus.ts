'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // 초기 상태 확인
    setIsConnected(true);

    // Realtime 상태 모니터링
    const subscription = supabase
      .channel('realtime-status')
      .on('system', { event: 'connect' }, () => {
        setIsConnected(true);
      })
      .on('system', { event: 'disconnect' }, () => {
        setIsConnected(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { isConnected };
}
