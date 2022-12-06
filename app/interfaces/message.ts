export interface Message {
  content: string;
  userId: string;
  roomId: string;
  receivedMessage: boolean;
  connectionId?: string;
  nickname: string;
  dogImage: string;
}
