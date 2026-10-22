import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/features/landing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${getSiteUrl()}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
