import { randomBytes } from "node:crypto";

console.log(randomBytes(33).toString('base64'));