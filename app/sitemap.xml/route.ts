import { supabase } from "../lib/supabase";

const BASE_URL = "https://eleganza-by-mittali.vercel.app";

type Product = {
  name: string;
};

export async function GET() {
  const { data: products, error } = await supabase
    .from("products")
    .select("name")
    .order("id", { ascending: true });

  if (error) {
    console.error("Sitemap product fetch error:", error);

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
  </url>
  <url>
    <loc>${BASE_URL}/shop</loc>
  </url>
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );
  }

  const staticUrls = [
    "/",
    "/shop",
    "/contact",
    "/login",
    "/register",
    "/privacy-policy",
    "/terms-conditions",
    "/shipping",
    "/cancellation-refund",
    "/return-exchange-policy",
  ];

  const staticEntries = staticUrls
    .map(
      (url) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
  </url>`
    )
    .join("");

  const productEntries = (products as Product[])
    .map((product) => {
      const slug = product.name
        .toLowerCase()
        .replaceAll(" ", "-");

      return `
  <url>
    <loc>${BASE_URL}/product/${encodeURIComponent(slug)}</loc>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${productEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}