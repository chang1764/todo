'use client';

import { supabase } from '@/lib/supabase';
import { BOARD_ID } from '@/lib/utils/constants';

export function useColumns() {
  const handleAddColumn = async (name: string, position: number = 0) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert([
          {
            board_id: BOARD_ID,
            name,
            position,
          },
        ])
        .select();

      if (error) throw error;
      return data?.[0];
    } catch (err) {
      console.error('Error adding column:', err);
      throw err;
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting column:', err);
      throw err;
    }
  };

  const handleReorderColumns = async (
    columns: Array<{ id: string; position: number }>
  ) => {
    try {
      for (const col of columns) {
        const { error } = await supabase
          .from('columns')
          .update({ position: col.position })
          .eq('id', col.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error reordering columns:', err);
      throw err;
    }
  };

  return {
    handleAddColumn,
    handleDeleteColumn,
    handleReorderColumns,
  };
}
