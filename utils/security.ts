import { compare, genSalt, hash } from "bcrypt";
import { createHash } from "crypto";

export const buildUnauthorizedResponse = () => ({
  redirect: {
    permanent: false,
    destination: `/login`,
  },
});

export const buildForbiddenResponse = () => ({
  redirect: {
    permanent: false,
    destination: `/403`,
  },
});

let _salt = genSalt(10).then((generatedSalt) => (_salt = generatedSalt));
export const encryptPassword = (password: string) =>
  hash(password, _salt);
export const validatePassword = (plainText: string, hash: string) =>
  compare(plainText, hash);
export const computeSha256Hash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
