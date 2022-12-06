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
        className={`flex gap-3 items-start ${
          myMessage ? "justify-end" : "justify-start"
        }`}
      >
        <div className="w-20">
          <img src={src} alt="user-avatar" className="w-16 h-16 rounded-full" />
        </div>
        <div className="flex flex-col w-48 sm:w-64">
          <h1 className="text-white">{nickname}</h1>
          <h1 className="text-blue-300 bg-blue-700 p-4 rounded-lg break-all">
            {message}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
