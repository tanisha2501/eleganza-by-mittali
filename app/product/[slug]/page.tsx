"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { products } from "../../lib/products";

const sizes = [
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

type Product = {
  name: string;
  category: string;
  price: string;
  image?: string;
  images?: string[];
  description: string;
  colours?: string[];
  sizes?: Record<string, number>;
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [allProducts, setAllProducts] =
    useState<Product[]>(products);

  const [productsLoaded, setProductsLoaded] =
    useState(false);

  useEffect(() => {
    const savedProducts =
      localStorage.getItem(
        "eleganza-products"
      );

    if (savedProducts) {
      const savedData = JSON.parse(
        savedProducts
      );

      setAllProducts([
        ...products,
        ...savedData,
      ]);
    }

    setProductsLoaded(true);
  }, []);

  const product = allProducts.find(
    (item) =>
      item.name
        .toLowerCase()
        .replaceAll(" ", "-") === slug
  );

  const [size, setSize] =
    useState("M");

  const [colour, setColour] =
    useState("Default");

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [quantity, setQuantity] =
    useState(1);

  const [currentStock, setCurrentStock] =
    useState(0);

  /*
   * Set first available colour
   */
  useEffect(() => {
    if (!product) return;

    const availableColours =
      product.colours &&
      product.colours.length > 0
        ? product.colours
        : ["Default"];

    setColour(
      availableColours[0]
    );
  }, [product]);

  /*
   * Wishlist size
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const wishlistSize =
      params.get("size");

    if (
      wishlistSize &&
      sizes.includes(
        wishlistSize as (typeof sizes)[number]
      )
    ) {
      setSize(wishlistSize);
    }
  }, []);

  /*
   * Load colour + size stock
   */
  useEffect(() => {
    if (!product) return;

    const savedStock =
      localStorage.getItem(
        "eleganza-stock"
      );

    if (savedStock) {
      const stockData =
        JSON.parse(savedStock);

      const productStock =
        stockData[product.name];

      /*
       * New colour-wise stock format
       */
      if (
        productStock &&
        productStock[colour] &&
        typeof productStock[colour] ===
          "object"
      ) {
        setCurrentStock(
          productStock[colour][size] ??
            0
        );
      }

      /*
       * Old size-only stock format
       * This keeps existing products working.
       */
      else {
        setCurrentStock(
          product.sizes?.[size] ?? 0
        );
      }
    } else {
      setCurrentStock(
        product.sizes?.[size] ?? 0
      );
    }

    setQuantity(1);
  }, [product, colour, size]);

  if (!productsLoaded) {
    return null;
  }

  if (!product) {
    return (
      <main className="product-not-found">
        <h1>Product Not Found</h1>
        <p>
          Sorry, this product is no longer
          available.
        </p>
      </main>
    );
  }

  const availableColours =
    product.colours &&
    product.colours.length > 0
      ? product.colours
      : ["Default"];

  const handleAddToCart = () => {
    const savedCart =
      localStorage.getItem(
        "eleganza-cart"
      );

    const currentCart = savedCart
      ? JSON.parse(savedCart)
      : [];

    const existingIndex =
      currentCart.findIndex(
        (item: {
          name: string;
          size: string;
          colour?: string;
        }) =>
          item.name === product.name &&
          item.size === size &&
          (item.colour ||
            "Default") === colour
      );

    if (existingIndex !== -1) {
      currentCart[
        existingIndex
      ].quantity += quantity;
    } else {
      currentCart.push({
        name: product.name,
        colour: colour,
        size: size,
        quantity: quantity,
      });
    }

    localStorage.setItem(
      "eleganza-cart",
      JSON.stringify(currentCart)
    );

    alert(
      `${product.name} added to cart!`
    );

    localStorage.setItem(
      "open-cart",
      "true"
    );

    window.location.href = "/";
  };

  const handleBuyNow = () => {
    const savedCart =
      localStorage.getItem(
        "eleganza-cart"
      );

    const currentCart = savedCart
      ? JSON.parse(savedCart)
      : [];

    const existingIndex =
      currentCart.findIndex(
        (item: {
          name: string;
          size: string;
          colour?: string;
        }) =>
          item.name === product.name &&
          item.size === size &&
          (item.colour ||
            "Default") === colour
      );

    if (existingIndex !== -1) {
      currentCart[
        existingIndex
      ].quantity += quantity;
    } else {
      currentCart.push({
        name: product.name,
        colour: colour,
        size: size,
        quantity: quantity,
      });
    }

    localStorage.setItem(
      "eleganza-cart",
      JSON.stringify(currentCart)
    );

    window.location.href =
      "/checkout";
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">

        {/* PRODUCT GALLERY */}

        <div className="product-detail-gallery">

          <div className="product-detail-image">
            <img
              src={
                product.images?.[
                  selectedImage
                ] ||
                product.image
              }
              alt={product.name}
            />
          </div>

          {product.images &&
            product.images.length > 1 && (
              <div className="product-thumbnail-list">
                {product.images.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={index}
                      type="button"
                      className={
                        selectedImage ===
                        index
                          ? "product-thumbnail active"
                          : "product-thumbnail"
                      }
                      onClick={() =>
                        setSelectedImage(
                          index
                        )
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
            )}

        </div>

        {/* PRODUCT INFORMATION */}

        <div className="product-detail-info">

          <p className="product-detail-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <p className="product-detail-price">
            {product.price}
          </p>

          <div className="product-detail-line"></div>

          <p className="product-description">
            {product.description}
          </p>

          {/* STOCK STATUS */}

          <div className="stock-status">
            {currentStock > 5 ? (
              <span>
                ✓ IN STOCK
              </span>
            ) : currentStock > 0 ? (
              <span>
                ⚠ ONLY {currentStock} LEFT
              </span>
            ) : (
              <span>
                ✕ OUT OF STOCK
              </span>
            )}
          </div>

          {/* COLOUR */}

          <div className="size-section">
            <div className="size-heading">
              <span>
                SELECT COLOUR
              </span>
            </div>

            <div className="size-options">
              {availableColours.map(
                (item) => (
                  <button
                    key={item}
                    className={
                      colour === item
                        ? "selected"
                        : ""
                    }
                    onClick={() => {
                      setColour(item);
                      setQuantity(1);
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SIZE */}

          <div className="size-section">
            <div className="size-heading">
              <span>
                SELECT SIZE
              </span>

              <span>
                Size Guide
              </span>
            </div>

            <div className="size-options">
              {sizes.map(
                (item) => {
                  const savedStock =
                    localStorage.getItem(
                      "eleganza-stock"
                    );

                  let availableSizeStock =
                    0;

                  if (savedStock) {
                    const stockData =
                      JSON.parse(
                        savedStock
                      );

                    const productStock =
                      stockData[
                        product.name
                      ];

                    if (
                      productStock &&
                      productStock[
                        colour
                      ] &&
                      typeof productStock[
                        colour
                      ] === "object"
                    ) {
                      availableSizeStock =
                        productStock[
                          colour
                        ][item] ?? 0;
                    } else {
                      availableSizeStock =
                        product.sizes?.[
                          item
                        ] ?? 0;
                    }
                  } else {
                    availableSizeStock =
                      product.sizes?.[
                        item
                      ] ?? 0;
                  }

                  return (
                    <button
                      key={item}
                      disabled={
                        availableSizeStock ===
                        0
                      }
                      className={
                        size === item
                          ? "selected"
                          : ""
                      }
                      onClick={() => {
                        setSize(item);
                        setQuantity(
                          1
                        );
                      }}
                    >
                      {item}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* QUANTITY */}

          <div className="quantity-section">
            <span>
              QUANTITY
            </span>

            <div className="detail-quantity">

              <button
                onClick={() =>
                  setQuantity(
                    (q) =>
                      Math.max(
                        1,
                        q - 1
                      )
                  )
                }
              >
                −
              </button>

              <span>
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    (q) =>
                      Math.min(
                        q + 1,
                        currentStock
                      )
                  )
                }
                disabled={
                  quantity >=
                  currentStock
                }
              >
                +
              </button>

            </div>
          </div>

          {/* ADD TO CART */}

          <button
            className="detail-add-cart"
            onClick={
              handleAddToCart
            }
            disabled={
              currentStock <= 0
            }
          >
            {currentStock <= 0
              ? "OUT OF STOCK"
              : "ADD TO CART"}
          </button>

          {/* BUY NOW */}

          <button
            className="detail-buy-now"
            onClick={
              handleBuyNow
            }
            disabled={
              currentStock <= 0
            }
          >
            {currentStock <= 0
              ? "OUT OF STOCK"
              : "BUY NOW"}
          </button>

          {/* FEATURES */}

          <div className="product-features">
            <p>
              ✓ Premium quality fabric
            </p>

            <p>
              ✓ Carefully crafted for elegance
            </p>

            <p>
              ✓ Easy exchange
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}