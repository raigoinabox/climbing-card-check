export function getMessage(e: unknown) {
  if (
    e != null &&
    typeof e == "object" &&
    "data" in e &&
    e.data != null &&
    typeof e.data == "object" &&
    "message" in e.data &&
    typeof e.data.message == "string"
  ) {
    const message = e.data.message;
    try {
      const errors = JSON.parse(message);
      if (1 <= errors.length) {
        return errors[0].message;
      }
    } catch {
      return message;
    }
  }

  return null;
}
