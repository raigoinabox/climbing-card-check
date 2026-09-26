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
    let title;
    let description: string | undefined;
    if ("data" in data && typeof data.data == "object" && data.data != null) {
      payload = data.data;
      if ("title" in payload && typeof payload.title == "string") {
        title = payload.title;
      }
      if ("description" in payload && typeof payload.description == "string") {
        description = payload.description;
      }
    }

    if (
      "message" in data &&
      typeof data.message == "string" &&
      1 <= data.message.length
    ) {
      try {
        const errors = JSON.parse(data.message);
        if (1 <= errors.length) {
          description = errors[0].message;
        }
      } catch {
        description = data.message;
      }
    }

    return { payload, title, description };
  }
}

export function getMessage(e: unknown) {
  return parseError(e)?.description;
}
