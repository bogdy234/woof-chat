import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
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
  const userId = await requireUserId(request);
  const user = await getUser(request);
  if (!user) {
    throw new Error("No user found");
  }
  const roomId = params?.roomId;

  const dbMessages =
    (await db.message.findMany({
      where: { roomName: roomId },
      orderBy: [
        {
          createdAt: "asc",
        },
      ],
    })) || [];

  const messages = dbMessages.map(async (m) => {
    const dbUser = await db.user.findUnique({ where: { id: m.userId } });
    if (!dbUser) {
      throw new Error("No user found for messages");
    }
    return {
      ...m,
      receivedMessage: dbUser.id !== userId,
      nickname: dbUser.nickname,
      dogImage: dbUser.dogImage,
      roomId: m.roomName,
    };
  });

  if (!roomId) {
    throw new Error("Room name not found");
  }
  const messagesData = await Promise.all([...messages]);
  return { user, roomId, messages: messagesData };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const content = form.get("content");
  const userId = form.get("userId");
  const roomId = form.get("roomId");

  if (
    typeof content !== "string" ||
    typeof userId !== "string" ||
    typeof roomId !== "string"
  ) {
    throw new Error("Invalid data type");
  }

  await db.message.create({
    data: {
      content: content,
      userId: userId,
      roomName: roomId,
    },
  });

  return null;
};

export default function RoomRoute() {
  const [messages, setMessages] = useState<Message[]>([]);
  const loaderData = useLoaderData();
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // handle receive messages
  useEffect(() => {
    setMessages(loaderData?.messages || []);
    socket.on("response", function (data: Message) {
      if (!data) {
        return;
      }
      const newMessage: Message = { ...data, receivedMessage: true };
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.emit("join", { roomId: loaderData?.roomId });

    // cleanup
    return () => {
      socket.off("response");
    };
  }, []);

  useEffect(() => {
    if (!chatRef.current) {
      return;
    }
    const handleScroll = () => {
      console.log(chatRef.current?.scrollTop);
      console.log("scrolled");
      if (chatRef?.current?.scrollTop === 0) {
        console.log("need to fetch more data");
      }
    };
    chatRef.current.addEventListener("scroll", handleScroll);
    return () => chatRef?.current?.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (messageInputRef.current === null) {
      return;
    }
    messageInputRef.current.scrollIntoView();
  }, [messageInputRef.current]);

  const handleSendMessages = (event: React.FormEvent<HTMLFormElement>) => {
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

    socket.emit("message", newMessage);
    messageInputRef.current!.value = "";
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className="w-11/12 h-[80vh] sm:w-9/12 bg-gray-500 p-10 rounded-lg overflow-y-scroll
      "
        ref={chatRef}
      >
        {messages.map((m) => (
          <MessageBubble
            src={m.dogImage}
            nickname={m.nickname}
            myMessage={!m.receivedMessage}
            message={m.content}
            key={`message-${m.connectionId}-${m.content}-${Math.random()}`}
          />
        ))}
        <Form
          method="post"
          onSubmit={handleSendMessages}
          className="flex flex-col gap-2 items-center"
        >
          <input
            type="text"
            name="message"
            ref={messageInputRef}
            className={`${styles.inputStyle} max-w-sm mt-4`}
            placeholder="Type your message here"
          />
          <button type="submit" className={styles.buttonStyle}>
            Send message
          </button>
        </Form>
      </div>
    </div>
  );
}
