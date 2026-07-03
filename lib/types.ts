export type Column = {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Card = {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Board = {
  id: string;
  name: string;
  created_at: string;
};
