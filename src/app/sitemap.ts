import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getAllMarketingPaths } from "@/lib/seo/publicRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  return getAllMarketingPaths().map((path) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : path.split("/").length <= 2 ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
