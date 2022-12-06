import { FC, ReactElement } from "react";

interface MessageProps {
  src: string;
  nickname: string;
  message: string;
  myMessage: boolean;
}

const MessageBubble: FC<MessageProps> = ({
  src,
  nickname,
  message,
  myMessage = true,
}): ReactElement => {
  return (
    <div>
      <div
        className={`flex gap-3 items-center ${
          myMessage ? "justify-end" : "justify-start"
        }`}
      >
        <img src={src} alt="user-avatar" className="w-16 h-16 rounded-full" />
        <h1 className="text-red-400">{message}</h1>
        {nickname}
      </div>
    </div>
  );
};

export default MessageBubble;
