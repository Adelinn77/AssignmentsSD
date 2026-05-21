export interface Answer {
  answerId: number;
  questionId: number;
  userId: number;
  authorName: string;
  authorScore?: number;
  text: string;
  likes: number;
  dislikes: number;
  dateTime: string;
  imageUrls: string[];
  currentUserVote?: string;
  accepted?: boolean;
}
