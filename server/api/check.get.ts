import { isIdCodeValid } from "../utils/exams_db.data-utils";
import * as key from "../utils/_key";
import { type CheckDto } from "~/shared/types/api_types";

export default defineEventHandler(async (event): Promise<CheckDto> => {
  const start = Date.now();
  const { id } = getQuery(event);

  try {
    if (typeof id != "string" || !isIdCodeValid(id)) {
      return {
        success: false,
        id,
        message: "Invalid id code",
      };
    }

    const secretKey = key.load();
    const sheetsClient = await connect(
      secretKey.client_email,
      secretKey.private_key,
    );

    return await fetchClimberData(sheetsClient, id);
  } finally {
    console.log({ ts: new Date(), responseTime: Date.now() - start, id });
  }
});
