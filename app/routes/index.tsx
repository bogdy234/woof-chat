import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getUser, logout, requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  return user;
};

export const action: ActionFunction = ({ request }) => logout(request);

export default function Index() {
  const data = useLoaderData();
  return (
    <div className="min-h-screen text-3xl font-bold underline flex flex-col justify-center items-center">
      <div className="bg-gray-500 w-1/2 h-[70vh] flex flex-col justify-center items-center rounded-3xl text-white">
        Hello {data.nickname}!
        <form method="post" action="/?index">
          <button>Logout</button>
        </form>
        <Link to={"/room/amstaff"}>Join room</Link>
      </div>
    </div>
  );
}
