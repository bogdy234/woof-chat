import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUser, requireUserId } from "~/utils/session.server";

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

export default function RoomRoute() {
  const data = useLoaderData();
  console.log(data);
  console.log("here");

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-11/12 h-[80vh] sm:w-9/12 bg-gray-500 p-10 rounded-lg"></div>
    </div>
  );
}
