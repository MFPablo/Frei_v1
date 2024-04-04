import bcrypt from "bcrypt";
import { createHash } from "crypto";
import { Session } from "next-auth";

export const isMTCAdmin = (session: Session) => {
  const email = session?.user?.email?.toString().toLowerCase();
  return email && (email.endsWith("@movethechain.com") || isDevEnvAdmin(email));
};
export const isDevEnvAdmin = (email: string) => {
  if (process.env.NODE_ENV === "production") return false;
  const adminDevs = ["test3@mailinator.com", "hernan.massad@gmail.com"];
  return adminDevs.indexOf(email) > -1;
};

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

let _salt;
bcrypt.genSalt(10).then((generatedSalt) => (_salt = generatedSalt));

export const encryptPassword = (password: string) =>
  bcrypt.hash(password, _salt);

export const validatePassword = (plainText: string, hash: string) =>
  bcrypt.compare(plainText, hash);

export const computeSha256Hash = (text: string) =>
  createHash("sha256").update(text).digest("hex");
