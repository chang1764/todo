'use client';

import { supabase } from '@/lib/supabase';
import type { Card } from '@/lib/types';

export function useCards() {
  const handleCreateCard = async (
    columnId: string,
    title: string,
    description?: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    dueDate?: string,
    position: number = 0
  ) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([
          {
            column_id: columnId,
            title,
            description,
            priority,
            due_date: dueDate,
            position,
          },
        ])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error('Error creating card:', err);
      throw err;
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    updates: Partial<Omit<Card, 'id' | 'created_at'>>
  ) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', cardId)
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error('Error updating card:', err);
      throw err;
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting card:', err);
      throw err;
    }
  };

  return {
    handleCreateCard,
    handleUpdateCard,
    handleDeleteCard,
  };
}
