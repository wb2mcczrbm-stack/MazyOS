import type { MetadataRoute } from "next";

const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url, lastModified: new Date(), priority: 1 }];
}
