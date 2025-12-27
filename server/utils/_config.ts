import process from "node:process";

export const registrationFee = 10;
export const emailAuth = {
  user: "taavi@ronimisliit.ee",
  pass: process.env.GOOGLE_APP_PASSWORD ?? "testtesttesttest",
};

let { EMAIL_TEST_TO } = process.env;

if (EMAIL_TEST_TO == null) {
  EMAIL_TEST_TO = "test@example.com";
}

export const email = {
  replyTo: "julgestajakaart@ronimisliit.ee",
  testTo: EMAIL_TEST_TO.split(",")
    .map((rec) => rec.trim())
    .filter((rec) => rec.length),
};

const { MONTONIO_ACCESS_KEY, MONTONIO_SECRET_KEY } = process.env;
export const montonio = {
  api: "https://sandbox-stargate.montonio.com/api",
  accessKey: MONTONIO_ACCESS_KEY ?? "test",
  secretKey: MONTONIO_SECRET_KEY ?? "test",
};

const { SITE_BASE, VERCEL_URL } = process.env;
export const siteBase = SITE_BASE || VERCEL_URL;
