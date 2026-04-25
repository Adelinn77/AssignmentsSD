export enum Status {
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export interface Question {
  title: string;
  text: string;
  likes: number;
  dislikes: number;
  date: string;
  status: Status | string;
  authorName: string;
  tags: string[];
  imageUrls: string[];
}
