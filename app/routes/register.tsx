import { useEffect, useState } from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import Dropdown from "~/components/Dropdown";
import { getRandomItem } from "~/utils/utils";
import {
  validateBreed,
  validateNickname,
  validatePassword,
} from "~/utils/validate";
import { getUserId, register } from "~/utils/session.server";
import REGISTER from "~/constants/register";
import styles from "~/constants/styles";

const labelInputContainerStyle = "flex flex-col gap-1 text-gray-200";
const labelStyle = "text-gray-100";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Register",
  viewport: "width=device-width,initial-scale=1",
});

interface ActionData {
  formError?: string;
  fieldErrors?: {
    nickname: string | undefined;
    password: string | undefined;
    breed: string | undefined;
  };
  fields?: {
    nickname: string;
    password: string;
    breed: string;
  };
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

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
  const breed = form.get("breed");

  if (
    typeof nickname !== "string" ||
    typeof password !== "string" ||
    typeof breed !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { nickname, password, breed };
  const fieldErrors = {
    nickname: validateNickname(nickname),
    password: validatePassword(password),
    breed: validateBreed(breed),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const response = await fetch(`https://dog.ceo/api/breed/${breed}/images`);
  const json = await response.json();

  const randomImage = getRandomItem(json.message);

  const data = {
    nickname,
    breed,
    dogImage: randomImage,
    password,
  };

  register(data);
  return redirect("/login");
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const [breed, setBreed] = useState<string>(REGISTER.DEFAULT_VALUE_BREED);

  useEffect(() => {
    const defaultBreed = actionData?.fields?.breed;
    if (!defaultBreed || breed !== REGISTER.DEFAULT_VALUE_BREED) {
      return;
    }
    setBreed(defaultBreed);
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <Form
        className="w-8/12 h-5/12 bg-gray-500 p-10 rounded-lg max-w-md flex flex-col gap-3"
        method="post"
      >
        <div className={labelInputContainerStyle}>
          <label htmlFor="nickname-input" className={labelStyle}>
            Nickname
          </label>
          <input
            type="text"
            id="nickname-input"
            name="nickname"
            className={styles.input}
            aria-invalid={Boolean(actionData?.fieldErrors?.nickname)}
            defaultValue={actionData?.fields?.nickname}
          />
        </div>
        {actionData?.fieldErrors?.nickname ? (
          <p
            className="form-validation-error text-red-200"
            role="alert"
            id="nickname-error"
          >
            {actionData.fieldErrors.nickname}
          </p>
        ) : null}
        <div className={labelInputContainerStyle}>
          <label htmlFor="password-input" className={labelStyle}>
            Password
          </label>
          <input
            type="password"
            id="password-input"
            name="password"
            className={styles.input}
            aria-invalid={Boolean(actionData?.fieldErrors?.password)}
            defaultValue={actionData?.fields?.password}
          />
          {actionData?.fieldErrors?.password ? (
            <p
              className="form-validation-error text-red-200"
              role="alert"
              id="password-error"
            >
              {actionData.fieldErrors.password}
            </p>
          ) : null}
        </div>
        <div className={labelInputContainerStyle}>
          <label htmlFor="breed-input" className={labelStyle}>
            Breed
          </label>
          <input
            type="hidden"
            id="breed-input"
            name="breed"
            readOnly
            value={breed}
          />
          <Dropdown selected={breed} setSelected={setBreed} />
          {actionData?.fieldErrors?.breed ? (
            <p
              className="form-validation-error text-red-200"
              role="alert"
              id="breed-error"
            >
              {actionData.fieldErrors.breed}
            </p>
          ) : null}
        </div>
        <div className="flex justify-center mt-2 mb-3">
          <button className={styles.button}>Register</button>
        </div>
        <p className="text-white">
          Already have an account? Login{" "}
          <a href="/login" className="underline">
            here
          </a>
          .
        </p>
      </Form>
    </div>
  );
}
