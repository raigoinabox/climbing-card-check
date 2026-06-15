export function createUrl(path: `/${string}`) {
  if (process.env.VERCEL_URL == null) {
    throw createError("Base vercel url is not configured");
  } else if (path[0] != "/") {
    throw createError("Path should start with /");
  }

  return `https://${process.env.VERCEL_URL}${path}`;
}
