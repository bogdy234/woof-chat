import { useEffect } from "react";
import io from "socket.io-client";

const socket = io();

export default function Index() {
  useEffect(() => {
    socket.on("onConnectData", function (data) {});
  }, []);

  const onClickSend = () => {
    socket.emit("message", {
      text: "This is my message",
      name: Math.round(Math.random() * 100),
      id: `${socket.id}${Math.random()}`,
      socketID: socket.id,
    });
  };

  return (
    <h1 className="text-3xl font-bold underline">
      Hello world!
      <div />
      <button onClick={onClickSend}>Send</button>
    </h1>
  );
}
