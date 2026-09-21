export function parseError(error: unknown) {
  if (
    error != null &&
    typeof error == "object" &&
    "data" in error &&
    error.data != null &&
    typeof error.data == "object"
  ) {
    const data = error.data;
    let payload;
    if ("data" in data && typeof data.data == "object") {
      payload = data.data;
    }

    let message;
    if (
      "message" in data &&
      typeof data.message == "string" &&
      1 <= data.message.length
    ) {
      try {
        const errors = JSON.parse(data.message);
        if (1 <= errors.length) {
          message = errors[0].message;
        }
      } catch {
        message = data.message;
      }
    }

    return { payload, message };
  }
}

export function getMessage(e: unknown) {
  return parseError(e)?.message;
}
