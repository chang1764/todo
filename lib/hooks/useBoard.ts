import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BOARD_ID } from '@/lib/utils/constants';
import type { Column, Card } from '@/lib/types';

export function useBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [colRes, cardRes] = await Promise.all([
        supabase
          .from('columns')
          .select('*')
          .eq('board_id', BOARD_ID)
          .order('position'),
        supabase.from('cards').select('*').order('position'),
      ]);

      if (colRes.error) throw colRes.error;
      if (cardRes.error) throw cardRes.error;

      setColumns(colRes.data || []);
      setCards(cardRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching board data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Realtime subscription
  useEffect(() => {
    const subscription = supabase
      .channel('board-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${BOARD_ID}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setColumns((prev) => [...prev, payload.new as Column]);
          } else if (payload.eventType === 'UPDATE') {
            setColumns((prev) =>
              prev.map((col) =>
                col.id === payload.new.id ? (payload.new as Column) : col
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setColumns((prev) => prev.filter((col) => col.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCards((prev) => [...prev, payload.new as Card]);
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.new.id ? (payload.new as Card) : card
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const refetch = async () => {
    try {
      const [colRes, cardRes] = await Promise.all([
        supabase
          .from('columns')
          .select('*')
          .eq('board_id', BOARD_ID)
          .order('position'),
        supabase.from('cards').select('*').order('position'),
      ]);

      if (!colRes.error) setColumns(colRes.data || []);
      if (!cardRes.error) setCards(cardRes.data || []);
    } catch (err) {
      console.error('Error refetching data:', err);
    }
  };

  return { columns, cards, loading, error, setColumns, setCards, refetch };
}
