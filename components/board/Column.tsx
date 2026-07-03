'use client';

import { useDroppable } from '@dnd-kit/core';
import { Card } from './Card';
import { Button } from '@/components/ui/button';
import { useColumns } from '@/lib/hooks/useColumns';
import type { Column as ColumnType, Card as CardType } from '@/lib/types';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  onAddCard: (columnId: string) => void;
  isFullWidth?: boolean;
}

export function Column({ column, cards, onCardClick, onAddCard, isFullWidth = false }: ColumnProps) {
  const { handleDeleteColumn } = useColumns();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const columnCards = cards
    .filter((card) => card.column_id === column.id)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl p-3 md:p-4 ${isFullWidth ? 'w-full h-fit' : 'min-w-72 md:min-w-96 max-h-[calc(100vh-150px)]'} border-2 transition-all ${
        isOver
          ? 'bg-blue-50 border-blue-300 shadow-lg'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-slate-200">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm md:text-base">{column.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 md:mt-1">
            {columnCards.length}개
          </p>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 md:h-8 md:w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-lg md:text-base"
            onClick={() => onAddCard(column.id)}
            title="Add card"
          >
            ➕
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 md:h-8 md:w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-lg md:text-base"
            onClick={() => {
              if (confirm(`"${column.name}" 컬럼을 삭제하시겠습니까?`)) {
                handleDeleteColumn(column.id);
              }
            }}
            title="Delete column"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 md:gap-3 overflow-y-auto pr-2 flex-1">
        {columnCards.length > 0 ? (
          columnCards.map((card) => (
            <div key={card.id} onClick={() => onCardClick(card)}>
              <Card card={card} />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 flex items-center justify-center flex-1">
            <p className="text-sm">카드 없음</p>
          </div>
        )}
      </div>
    </div>
  );
}
