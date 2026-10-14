export interface Card {
  _id: string;
  columnId: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  labels: string[];
  position: number;
  assignees: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
