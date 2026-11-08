import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return ["", "/register", "/login", "/privacy", "/terms", "/for/companies", "/for/professionals", "/for/agencies"].map(path=>({url:`https://www.contractpros.co.uk${path}`})); }
