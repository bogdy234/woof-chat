import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import styles from "~/constants/styles";
import { createUserSession, getUserId, login } from "~/utils/session.server";
import { validateNickname } from "~/utils/validate";

const labelInputContainerStyle = "flex flex-col gap-1 text-gray-200";
const labelStyle = "text-gray-100";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Login",
  viewport: "width=device-width,initial-scale=1",
});

interface ActionData {
  formError?: string;
  fieldErrors?: {
    nickname: string | undefined;
  };
  fields?: {
    nickname: string;
    password: string;
    redirectTo: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

function validateUrl(url: any) {
  let urls = ["/"];
  if (urls.includes(url) || url.includes("/room/")) {
    return url;
  }
  return "/";
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const nickname = form.get("nickname");
  const password = form.get("password");
  const redirectTo = validateUrl(form.get("redirectTo"));

  if (
    typeof nickname !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    throw new Error("Invalid type.");
  }

  const fields = { nickname, password, redirectTo };
  const fieldErrors = {
    nickname: validateNickname(nickname),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const user = await login(fields);

  if (!user) {
    return {
      formError: "Username and password does not match.",
    };
  }
  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const actionData = useActionData();
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Form
        className="w-11/12 sm:w-8/12 sm:h-5/12 bg-gray-500 p-10 rounded-lg max-w-md flex flex-col gap-3"
        method="post"
      >
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        {actionData?.dogImage && <img src={actionData?.dogImage} alt="dog" />}
        <div className={labelInputContainerStyle}>
          <label htmlFor="nickname-input" className={labelStyle}>
            Nickname
          </label>
          <input
            type="text"
            id="nickname-input"
            name="nickname"
            className={styles.inputStyle}
          />
          {actionData?.fieldErrors?.nickname ? (
            <p
              className="form-validation-error text-red-200"
              role="alert"
              id="nickname-error"
            >
              {actionData.fieldErrors.nickname}
            </p>
          ) : null}
        </div>
        <div className={labelInputContainerStyle}>
          <label htmlFor="password-input" className={labelStyle}>
            Password
          </label>
          <input
            type="password"
            id="password-input"
            name="password"
            className={styles.inputStyle}
          />
        </div>
        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="text-red-200" role="alert">
              {actionData.formError}
            </p>
          ) : null}
        </div>
        <div className="flex justify-center mb-3">
          <button className={styles.buttonStyle}>Login</button>
        </div>
        <p className="text-white">
          Don't have an account yet? Register{" "}
          <a href="/register" className="underline">
            here
          </a>
          .
        </p>
      </Form>
    </div>
  );
}
