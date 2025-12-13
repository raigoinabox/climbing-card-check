export default defineEventHandler(async (event): Promise<CheckDto> => {
  const { id } = getQuery(event);

  if (typeof id != "string" || !isIdCodeValid(id)) {
    return {
      success: false,
      id,
      message: "Invalid id code",
    };
  }

  try {
    const result = await findExamById(id);

    return {
      success: true,
      ...result,
    };
  } catch (err) {
    let message = undefined;
    if (typeof err == "object" && err != null && "message" in err) {
      message = err.message;
    }
    return {
      id,
      success: false,
      message,
    };
  }
});
