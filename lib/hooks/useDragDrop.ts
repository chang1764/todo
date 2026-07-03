'use client';

import { useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { supabase } from '@/lib/supabase';

export function useDragDrop() {
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      const [type, cardId] = active.id.toString().split('-');

      // 카드 드래그
      if (type === 'card') {
        const targetColumnId = over.id.toString();

        // 같은 컬럼인 경우 순서만 변경
        if (active.data.current?.columnId === targetColumnId) {
          // TODO: 순서 변경 로직 (복잡함, MVP에서는 제외)
          return;
        }

        // 다른 컬럼으로 이동
        const { error } = await supabase
          .from('cards')
          .update({ column_id: targetColumnId, position: 0 })
          .eq('id', cardId);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating card position:', err);
    }
  }, []);

  return { handleDragEnd };
}
