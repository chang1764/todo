'use client';

import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/utils/constants';
import type { Card as CardType } from '@/lib/types';

interface CardProps {
  card: CardType;
}

export function Card({ card }: CardProps) {
  const priorityColor = PRIORITY_COLORS[card.priority];
  const [isHighlighted, setIsHighlighted] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `card-${card.id}`,
    data: { columnId: card.column_id },
  });

  // 카드가 변경되면 하이라이트 표시
  useEffect(() => {
    setIsHighlighted(true);
    const timer = setTimeout(() => setIsHighlighted(false), 1000);
    return () => clearTimeout(timer);
  }, [card.updated_at]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing group ${
        isDragging ? 'opacity-50 shadow-xl ring-2 ring-blue-400' : ''
      } ${isHighlighted ? 'ring-2 ring-emerald-300 bg-emerald-50' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${priorityColor.dot} flex-shrink-0`}></span>
        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
          {card.title}
        </h4>
      </div>

      {card.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 ml-4">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor.bg} ${priorityColor.text}`}
        >
          {PRIORITY_LABELS[card.priority]}
        </span>

        {card.due_date && (
          <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
            {new Date(card.due_date).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
