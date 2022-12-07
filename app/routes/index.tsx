import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import Dropdown from "~/components/Dropdown";
import styles from "~/constants/styles";
import { getUser, logout, requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  return user;
};

export const action: ActionFunction = ({ request }) => logout(request);

export default function Index() {
  const [breed, setBreed] = useState<string>("Select breed");
  const data = useLoaderData();

  return (
    <div className="min-h-screen text-3xl font-bold flex flex-col justify-center items-center">
      <div className="bg-gray-500 w-1/2 h-[70vh] flex flex-col gap-5 justify-center items-center rounded-3xl text-white">
        Hello {data.nickname}!
        <form method="post" action="/?index">
          <button className={styles.button}>Logout</button>
        </form>
        <Link to={`/room/${data?.breed}`} className="underline">
          Join room of your breed
        </Link>
        <div className="mt-7 flex flex-col gap-3">
          <Dropdown selected={breed} setSelected={setBreed} />
          <Link to={`/room/${breed}`} className="underline">
            Join room of another breed
          </Link>
        </div>
      </div>
    </div>
  );
}
