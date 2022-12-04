import { prisma } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useEffect } from "react";
import io from "socket.io-client";
import { getUser, logout, requireUserId } from "~/utils/session.server";

const socket = io();

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  return user;
};

export const action: ActionFunction = ({ request }) => logout(request);

export default function Index() {
  const data = useLoaderData();
  const [searchParams] = useSearchParams();

  console.log(data);
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
      {/* <input
        type="hidden"
        name="redirectTo"
        value={searchParams.get("redirectTo") ?? undefined}
      /> */}
      <form method="post" action="/?index">
        <button>Logout</button>
      </form>
    </h1>
  );
}
