import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { getUser, requireUserId } from "~/utils/session.server";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "~/components/MessageBubble";
import { Message } from "~/interfaces/message";
import styles from "~/constants/styles";

const socket = io();

export const meta: MetaFunction<typeof loader> = ({ params }) => ({
  charset: "utf-8",
  title: `Room ${params.roomId}`,
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ params, request }) => {
  // validateRoomName (else -> redirect to /)
  await requireUserId(request);
  const user = await getUser(request);

  return { user, params };
};

export const action: ActionFunction = async ({ request }) => {
  console.log("heree");
  return {};
};

export default function RoomRoute() {
  const submit = useSubmit();
  const [messages, setMessages] = useState<Message[]>([]);
  const loaderData = useLoaderData();
  const messageInputRef = useRef<HTMLInputElement>(null);

  // handle receive messages
  useEffect(() => {
    socket.on("response", function (data: Message) {
      if (!data) {
        return;
      }
      const newMessage: Message = { ...data, receivedMessage: true };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.emit("join", { roomId: loaderData.params.roomId });

    // cleanup
    return () => {
      socket.off("response");
    };
  }, []);

  // handle send messages
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageContent = messageInputRef.current?.value;

    if (!messageContent) {
      return;
    }

    const newMessage = {
      content: messageContent,
      userId: loaderData.user.id,
      roomId: loaderData.params.roomId,
      receivedMessage: false,
      connectionId: socket.id,
      nickname: loaderData.user.nickname,
      dogImage: loaderData.user.dogImage,
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("message", newMessage);
    messageInputRef.current!.value = "";
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-11/12 h-[80vh] sm:w-9/12 bg-gray-500 p-10 rounded-lg">
        {messages.map((m) => (
          <MessageBubble
            src={m.dogImage}
            nickname={m.nickname}
            myMessage={!m.receivedMessage}
            message={m.content}
            key={`message-${m.connectionId}-${m.content}-${Math.random()}`}
          />
        ))}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 items-center"
        >
          <input
            type="text"
            name="message"
            ref={messageInputRef}
            className={`${styles.inputStyle} max-w-sm`}
          />
          <button type="submit" className={styles.buttonStyle}>
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
