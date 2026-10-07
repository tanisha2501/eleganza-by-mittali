import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/",
          "/contact",
          "/shipping",
          "/exchange-return",
          "/cancellation-refund",
          "/privacy-policy",
          "/terms-conditions",
        ],
        disallow: [
          "/admin/",
          "/account/",
          "/checkout",
          "/order-success",
          "/api/",
        ],
      },
    ],
    sitemap: "https://eleganza-by-mittali.vercel.app/sitemap.xml",
  };
}