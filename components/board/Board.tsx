'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { CardModal } from './CardModal';
import { useBoard } from '@/lib/hooks/useBoard';
import { useColumns } from '@/lib/hooks/useColumns';
import { useDragDrop } from '@/lib/hooks/useDragDrop';
import { Button } from '@/components/ui/button';
import type { Card } from '@/lib/types';

export function Board() {
  const { columns, cards, loading, error, refetch } = useBoard();
  const { handleAddColumn } = useColumns();
  const { handleDragEnd } = useDragDrop();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card?: Card;
    columnId?: string;
  }>({ isOpen: false });
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const handleAddCard = (columnId: string) => {
    setModalState({ isOpen: true, columnId });
  };

  const handleCardClick = (card: Card) => {
    setModalState({ isOpen: true, card });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false });
  };

  const handleAddNewColumn = async () => {
    const name = prompt('컬럼 이름을 입력하세요:');
    if (name?.trim()) {
      setIsAddingColumn(true);
      try {
        await handleAddColumn(name.trim(), columns.length);
      } catch (err) {
        alert('컬럼 추가 실패: ' + (err instanceof Error ? err.message : '오류'));
      } finally {
        setIsAddingColumn(false);
      }
    }
  };

  const handleBoardDragEnd = async (event: DragEndEvent) => {
    await handleDragEnd(event);
    await refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ 오류 발생</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">
            Supabase 연결을 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleBoardDragEnd}>
      <div className="h-full flex flex-col">
        <div className="flex gap-3 md:gap-6 overflow-x-auto pb-4 flex-1 px-2 md:px-0">
          {columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={cards}
                onCardClick={handleCardClick}
                onAddCard={handleAddCard}
              />
            ))}

          <button
            onClick={handleAddNewColumn}
            disabled={isAddingColumn}
            className="min-w-64 h-fit px-4 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-slate-400 hover:bg-slate-100 font-semibold transition flex items-center justify-center gap-2"
          >
            {isAddingColumn ? '추가 중...' : '➕ 새 컬럼'}
          </button>
        </div>

        <CardModal
          card={modalState.card}
          columnId={modalState.columnId || ''}
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onRefresh={refetch}
        />
      </div>
    </DndContext>
  );
}
