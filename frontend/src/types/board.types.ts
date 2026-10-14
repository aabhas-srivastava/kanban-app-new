export interface Board {
  _id: string;
  title: string;
  description?: string;
  isArchived: boolean;
  ownerId: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  title: string;
  description?: string;
}