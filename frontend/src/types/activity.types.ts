export interface Activity {
  _id: string;
  boardId: string;
  cardId?: {
    _id: string;
    title: string;
  } | null;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  meta: Record<string, unknown>;
  createdAt: string;
}
