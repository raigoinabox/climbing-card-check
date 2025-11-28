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

    const sheetsClient = await connectToSheets();

    return await fetchClimberData(sheetsClient, id);
  } finally {
    console.log({ ts: new Date(), responseTime: Date.now() - start, id });
  }
});
