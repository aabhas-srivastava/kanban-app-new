export interface Comment {
  _id: string;
  cardId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  text: string;
  createdAt: string;
  updatedAt: string;
}
