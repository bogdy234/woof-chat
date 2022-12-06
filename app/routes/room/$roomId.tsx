import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getUser, requireUserId } from "~/utils/session.server";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "~/components/MessageBubble";
import { Message } from "~/interfaces/message";
import styles from "~/constants/styles";
import User from "~/interfaces/user";
import { db } from "~/utils/db.server";

const socket = io();

export const meta: MetaFunction<typeof loader> = ({ params }) => ({
  charset: "utf-8",
  title: `Room ${params.roomId}`,
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({
  params,
  request,
}): Promise<{
  user: Partial<User>;
  roomId: string;
  messages: Message[];
}> => {
  // validateRoomName (else -> redirect to /)
  await requireUserId(request);
  const user = await getUser(request);
  if (!user) {
    throw new Error("No user found");
  }
  const roomId = params?.roomId;

  const dbMessages =
    (await db.message.findMany({
      where: { roomName: roomId },
    })) || [];

  const messages = dbMessages.map(async (m) => {
    const dbUser = await db.user.findUnique({ where: { id: m.userId } });
    if (!dbUser) {
      throw new Error("No user found for messages");
    }
    console.log(dbUser);
    return {
      ...m,
      receivedMessage: m.userId !== user.id,
      nickname: dbUser.nickname,
      dogImage: dbUser.dogImage,
    };
  });

  if (!roomId) {
    throw new Error("Room name not found");
  }
  const messagesData = await Promise.all([...messages]);
  console.log("messages", messagesData);
  return { user, roomId, messages: messagesData };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const data = Object.fromEntries(form);
  const isValid = Object.values(data).every((v) => typeof v === "string");
  if (!isValid) {
    throw new Error("Invalid data type");
  }

  await db.message.create({
    data: {
      content: data.content,
      userId: data.userId,
      roomName: data.roomId,
    },
  });

  return data;
};

export default function RoomRoute() {
  const [messages, setMessages] = useState<Message[]>([]);
  const loaderData = useLoaderData();
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  // handle receive messages
  useEffect(() => {
    setMessages(loaderData.messages);
    socket.on("response", function (data: Message) {
      if (!data) {
        return;
      }
      const newMessage: Message = { ...data, receivedMessage: true };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.emit("join", { roomId: loaderData.roomId });

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
      roomId: loaderData.roomId,
      receivedMessage: false,
      connectionId: socket.id,
      nickname: loaderData.user.nickname,
      dogImage: loaderData.user.dogImage,
    };

    setMessages((prev) => [...prev, newMessage]);

    // make receivedMessage falsy
    fetcher.submit({ ...newMessage, receivedMessage: "" }, { method: "post" });
    socket.emit("message", newMessage);
    messageInputRef.current!.value = "";
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="w-11/12 h-[80vh] sm:w-9/12 bg-gray-500 p-10 rounded-lg overflow-y-scroll
      "
      >
        <fetcher.Form method="post" />
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
