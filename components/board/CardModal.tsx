'use client';

import { CardEditForm } from './CardEditForm';
import { useCards } from '@/lib/hooks/useCards';
import type { Card } from '@/lib/types';

interface CardModalProps {
  card?: Card;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
}

export function CardModal({
  card,
  columnId,
  isOpen,
  onClose,
  onRefresh,
}: CardModalProps) {
  const { handleCreateCard, handleUpdateCard, handleDeleteCard } = useCards();

  if (!isOpen) return null;

  // 모바일에서는 전체 화면, 데스크톱에서는 모달
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
  }) => {
    try {
      if (card) {
        await handleUpdateCard(card.id, data);
      } else {
        await handleCreateCard(columnId, data.title, data.description, data.priority, data.dueDate);
      }
      await onRefresh?.();
    } finally {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl md:rounded-lg shadow-lg max-w-md w-full mx-0 md:mx-4 max-h-[90vh] md:max-h-auto overflow-y-auto md:overflow-visible">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {card ? '카드 수정' : '새 카드'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 md:p-6">
          <CardEditForm
            card={card}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />

          {card && (
            <button
              onClick={async () => {
                if (confirm('정말 삭제하시겠습니까?')) {
                  try {
                    await handleDeleteCard(card.id);
                    await onRefresh?.();
                  } finally {
                    onClose();
                  }
                }
              }}
              className="mt-4 w-full px-4 py-2.5 md:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm md:text-base"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
