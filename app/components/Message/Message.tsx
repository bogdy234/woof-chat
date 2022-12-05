import { FC, ReactElement } from "react";

interface MessageProps {
  src: string;
  nickname: string;
}

const Message: FC<MessageProps> = ({ src, nickname }): ReactElement => {
  return (
    <div>
      <div className="flex gap-3 items-center">
        <img src={src} alt="user-avatar" className="w-16 h-16 rounded-full" />
        <h1>Message</h1>
      </div>
      {nickname}
    </div>
  );
};

export default Message;
