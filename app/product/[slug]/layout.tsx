import type { Metadata } from "next";
import { supabase } from "../../lib/supabase";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const productSlug = decodeURIComponent(slug);

  const { data: products } = await supabase
    .from("products")
    .select("name, description, image, images, category")
    .order("id", { ascending: true });

  const product = products?.find(
    (item) =>
      item.name.toLowerCase().replaceAll(" ", "-") === productSlug
  );

  if (!product) {
    return {
      title: "Product Not Found | Eleganza by Mittali",
      description:
        "The requested product could not be found at Eleganza by Mittali.",
    };
  }

  const title = `${product.name} | Eleganza by Mittali`;

  const description =
    product.description ||
    `Shop ${product.name} from Eleganza by Mittali. Discover elegant Indian fashion and ethnic wear.`;

  const image =
    product.images?.[0] ||
    product.image ||
    "/logo.png";

  const canonicalUrl = `https://eleganza-by-mittali.vercel.app/product/${productSlug}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    keywords: [
      product.name,
      product.category,
      "Eleganza by Mittali",
      "Indian Fashion",
      "Ethnic Wear",
    ],

    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Eleganza by Mittali",
      url: canonicalUrl,
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}