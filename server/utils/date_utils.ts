export function getIsoNow() {
  return new Date().toISOString();
}

export function formatIsoDateTime(date: Date) {
  return date.toISOString();
}

export function parseIsoDateTime(datetime: string) {
  return new Date(datetime);
}
