import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/register", "/login", "/privacy", "/terms"].map(path=>({url:`https://www.contractpros.co.uk${path}`})); }
