import REGISTER from "~/constants/register";

export const validateNickname = (nickname: string) => {
  if (typeof nickname !== "string" || nickname.length < 3) {
    return `Nicknames must be at least 3 characters long.`;
  }
};

export const validatePassword = (password: string) => {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long.`;
  }
};

export const validateBreed = (breed: string) => {
  if (typeof breed !== "string") {
    return `Invalid type`;
  }
  if (breed === REGISTER.DEFAULT_VALUE_BREED) {
    return `You must select a breed.`;
  }
};
