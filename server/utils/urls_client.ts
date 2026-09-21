export function createUrl(
  path: `/${string}`,
  queryParams?: Record<string, string>,
) {
  if (process.env.VERCEL_URL == null) {
    throw createError("Base vercel url is not configured");
  }

  const queryParamStrings = [];
  if (queryParams != null) {
    for (const [key, value] of Object.entries(queryParams)) {
      queryParamStrings.push(`${key}=${encodeURIComponent(value)}`);
    }
  }
  const queryPart =
    1 <= queryParamStrings.length ? `?${queryParamStrings.join("&")}` : "";

  return `https://${process.env.VERCEL_URL}${path}${queryPart}`;
}
