import { ActionFunction, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import styles from "~/constants/styles";
import { createUserSession, login } from "~/utils/session.server";
import { validateNickname, validatePassword } from "~/utils/validate";

const labelInputContainerStyle = "flex flex-col gap-1 text-gray-200";
const inputStyle =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
const labelStyle = "text-gray-100";

interface ActionData {
  formError?: string;
  fieldErrors?: {
    nickname: string | undefined;
  };
  fields?: {
    nickname: string;
    password: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const nickname = form.get("nickname");
  const password = form.get("password");

  if (typeof nickname !== "string" || typeof password !== "string") {
    throw new Error("Invalid type.");
  }

  const fields = { nickname, password };
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
  return createUserSession(user.id, "/");
};

export default function Login() {
  const actionData = useActionData();

  console.log(actionData);
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-dog-wallpaper">
      <form
        className="w-11/12 sm:w-8/12 sm:h-5/12 bg-gray-500 p-10 rounded-lg max-w-md flex flex-col gap-3"
        method="post"
      >
        {actionData?.dogImage && <img src={actionData?.dogImage} alt="dog" />}
        <div className={labelInputContainerStyle}>
          <label htmlFor="nickname-input" className={labelStyle}>
            Nickname
          </label>
          <input
            type="text"
            id="nickname-input"
            name="nickname"
            className={inputStyle}
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
            className={inputStyle}
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
      </form>
    </div>
  );
}
