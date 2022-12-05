import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getUser, requireUserId } from "~/utils/session.server";
import io from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import Message from "~/components/Message";

const socket = io();

export const meta: MetaFunction<typeof loader> = ({ params }) => ({
  charset: "utf-8",
  title: `Room ${params.roomId}`,
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ params, request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  console.log(params);
  return { user, params };
};

// export const action: ActionFunction = async ({ request }) => {
//   const data = await request.formData();
//   const myMessage = data.get("message");
//   socket.emit("message", myMessage);
//   return { myMessage };
// };

export default function RoomRoute() {
  const [messages, setMessages] = useState<string[]>([]);
  const loaderData = useLoaderData();
  const messageInputRef = useRef<HTMLInputElement>(null);
  // const actionData = useActionData();
  // console.log("loaderData", data);
  // console.log("actionData", actionData);

  console.log("render");

  useEffect(() => {
    socket.on("response", function (data) {
      console.log(
        "data in useEffect received in response from the server",
        data
      );
      if (typeof data === "string") {
        setMessages((prev) => [...prev, data]);
      }
      console.log(socket.id);
    });
    return () => {
      socket.off("response");
    };
  }, []);

  console.log(loaderData?.user);

  console.log(messageInputRef.current?.value);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    socket.emit("message", {
      connectionId: socket.id,
      message: messageInputRef.current?.value,
    });
    messageInputRef.current!.value = "";
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-11/12 h-[80vh] sm:w-9/12 bg-gray-500 p-10 rounded-lg">
        <Message
          src={loaderData?.user?.dogImage}
          nickname={loaderData?.user?.nickname}
        />
        {messages.map((message) => (
          <div key={message}>{message}</div>
        ))}
        <form onSubmit={handleSubmit}>
          <input type="text" name="message" ref={messageInputRef} />
          <button type="submit">Emit message</button>
        </form>
      </div>
    </div>
  );
}
