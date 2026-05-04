export interface Answer {
  answerId: number;
  questionId: number;
  userId: number;
  authorName: string;
  text: string;
  likes: number;
  dislikes: number;
  dateTime: string;
  imageUrls: string[];
}
