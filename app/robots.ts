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
          "/return-exchange-policy",
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
    sitemap: "https://eleganzabymittali.com/sitemap.xml",
  };
}