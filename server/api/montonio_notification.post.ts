import { z } from "zod";
import { handleMontonioEvent } from "#server/utils/montonio_service";

const schema = z.object({ orderToken: z.string() });

export default defineEventHandler(async (event) => {
  const { orderToken } = await readValidatedBody(event, (body) =>
    schema.parse(body),
  );
  handleMontonioEvent(orderToken);
  setResponseStatus(event, 201);
});
