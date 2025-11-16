import { isIdCodeValid } from "../utils/_db.data-utils";
import * as db from "../utils/_db";
import * as key from "../utils/_key";

export default defineEventHandler(async (event) => {
  const start = Date.now();
  const { id } = getQuery(event);

  if (typeof id != "string" || !isIdCodeValid(id)) {
    console.log({ ts: new Date(), responseTime: Date.now() - start, id });
    return {
      success: false,
      id,
      message: "Invalid id code",
    };
  }

  const secretKey = key.load();
  const sheetsClient = await db.connect(
    secretKey.client_email,
    secretKey.private_key,
  );

  const result = await db.fetchOne(sheetsClient, id);

  console.log({ ts: new Date(), responseTime: Date.now() - start, id });
  return result;
});
