import { readFileSync } from "fs";
import { z } from "zod";

const loadFromEnv = (varName: string): string => {
  const value = process.env[varName];
  if (typeof value !== "string") {
    throw new Error(`Environment var "${varName}" is unset`);
  }
  return Buffer.from(value, "base64").toString("utf8");
};

const loadFromFile = (filePath: string): string => {
  return readFileSync(filePath, "utf8");
};

const keySchema = z.object({
  private_key: z.string(),
  client_email: z.string(),
  client_id: z.string(),
});

let key: z.infer<typeof keySchema> | null = null;
export function getGoogleKey() {
  if (key == null) {
    const defaultEnvironmentVariable = "GOOGLE_KEY";
    const defaultFilePath = "./key.json";

    let dataString;
    if (process.env[defaultEnvironmentVariable]) {
      dataString = loadFromEnv(defaultEnvironmentVariable);
    } else {
      dataString = loadFromFile(defaultFilePath);
    }

    key = keySchema.parse(JSON.parse(dataString));
  }
  return key;
}
