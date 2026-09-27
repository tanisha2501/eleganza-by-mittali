"use client";

import { useEffect, useState } from "react";
import { products } from "../lib/products";
import { supabase } from "../lib/supabase";

type Product = {
  name: string;
  category: string;
  price: string;
  image?: string;
  images?: string[];
  description: string;
  sizes?:
  | Record<string, number>
  | Record<string, Record<string, number>>;
};

const categories = [
  "All",
  "Farshi Suits",
  "Cord Sets",
  "Suits",
  "Anarkali",
  "Pakistani Suits",
  "Sharara Sets",
];

export default function ShopPage() {
const [allProducts, setAllProducts] =
  useState<Product[]>([]);

const [productsLoading, setProductsLoading] =
  useState(true);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

useEffect(() => {
  const loadProducts = async () => {
    setProductsLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Error loading products:",
        error
      );

      setAllProducts(products);
      setProductsLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setAllProducts(data);
    } else {
      setAllProducts(products);
    }

    setProductsLoading(false);
  };

  loadProducts();
}, []);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const category = params.get("category");

    if (category) {
      setSelectedCategory(category);
    }
  }, []);

const filteredProducts =
  selectedCategory === "All"
    ? allProducts
    : allProducts.filter(
        (product) =>
          product.category
            .toLowerCase()
            .replace(/s$/, "") ===
          selectedCategory
            .toLowerCase()
            .replace(/s$/, "")
      );

  return (
    <main className="shop-page">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">

          <a href="/" className="brand">
            <img
              src="/logo.png"
              alt="Eleganza by Mittali"
              className="logo"
            />
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/shop">Shop</a>
            <a href="/#categories">
              Collections
            </a>
            <a href="/#about">
              About Us
            </a>
            <a href="/#contact">
              Contact
            </a>
          </nav>

        </div>
      </header>

      {/* SHOP HEADER */}
      <section className="shop-header">
        <p className="small-heading">
          ELEGANZA BY MITTALI
        </p>

        <h1>Shop Collection</h1>

        <p>
          Discover elegant styles crafted for
          every occasion.
        </p>
      </section>

      {/* CATEGORY FILTER */}
      <div className="shop-category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category
                ? "active"
                : ""
            }
            onClick={() =>
              setSelectedCategory(category)
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      <section className="shop-products">

        {!productsLoading && filteredProducts.length === 0 ?(
          <div className="shop-empty">
            <h2>No Products Found</h2>
            <p>
              No products are available in this
              category yet.
            </p>
          </div>
        ) : (
          <div className="product-grid">

            {filteredProducts.map((product) => (
              <div
                className="product-card"
                key={product.name}
                onClick={() => {
                  window.location.href =
                    `/product/${product.name
                      .toLowerCase()
                      .replaceAll(" ", "-")}`;
                }}
              >

                <div className="product-image">
                  <img
                    src={
                      product.images?.[0] ||
                      product.image
                    }
                    alt={product.name}
                  />
                </div>

                <div className="product-info">

                  <p className="product-category">
                    {product.category}
                  </p>

                  <h3>{product.name}</h3>

                 <strong>
  Rs {Number(
    String(product.price).replace(/[₹,Rs\s]/gi, "")
  ).toLocaleString("en-IN")}
</strong>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}