import { z } from "zod";
import { handleMontonioEvent } from "#server/utils/montonio_service";

const schema = z.object({ "order-token": z.string().min(1) });

export default defineEventHandler(async (event) => {
  const params = await getValidatedQuery(event, (query) => schema.parse(query));

  // TODO lisa try catch ja kasutajale mõnus ümber suunamine
  await handleMontonioEvent(params["order-token"]);
  await sendRedirect(event, "/register-exam/climber-success");
});
