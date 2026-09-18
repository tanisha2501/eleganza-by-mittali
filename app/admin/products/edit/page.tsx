"use client";

import { useEffect, useState } from "react";

const sizes = [
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export default function EditProductPage() {
  const [productName, setProductName] =
    useState("");

  const [category, setCategory] =
    useState("Farshi Suit");

  const [price, setPrice] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [colours, setColours] =
    useState<string[]>(["Default"]);

  const [newColour, setNewColour] =
    useState("");

  const [stock, setStock] = useState<
    Record<string, Record<string, number>>
  >({
    Default: {
      M: 0,
      L: 0,
      XL: 0,
      XXL: 0,
      XXXL: 0,
    },
  });

  const [images, setImages] =
    useState<string[]>([]);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const name = params.get("name");

    if (!name) return;

    const savedProducts =
      localStorage.getItem(
        "eleganza-products"
      );

    if (!savedProducts) return;

    const products =
      JSON.parse(savedProducts);

    const product = products.find(
      (item: { name: string }) =>
        item.name === name
    );

    if (!product) return;

    setProductName(product.name);

    setCategory(product.category);

    setPrice(
      product.price.replace(
        /[₹,]/g,
        ""
      )
    );

    setDescription(
      product.description
    );

    setImages(
      product.images ||
        (product.image
          ? [product.image]
          : [])
    );

    /*
     * Load colours
     */
    const savedColours =
      product.colours &&
      product.colours.length > 0
        ? product.colours
        : ["Default"];

    setColours(savedColours);

    /*
     * Load colour-wise stock
     */
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
       * New colour-wise format
       */
      if (
        productStock &&
        typeof Object.values(
          productStock
        )[0] === "object"
      ) {
        setStock(productStock);
      }

      /*
       * Old size-only format
       */
      else {
        setStock({
          Default: {
            M:
              productStock?.M ??
              product.sizes?.M ??
              0,

            L:
              productStock?.L ??
              product.sizes?.L ??
              0,

            XL:
              productStock?.XL ??
              product.sizes?.XL ??
              0,

            XXL:
              productStock?.XXL ??
              product.sizes?.XXL ??
              0,

            XXXL:
              productStock?.XXXL ??
              product.sizes?.XXXL ??
              0,
          },
        });
      }
    } else {
      /*
       * Fallback to product sizes
       */
      setStock({
        Default: {
          M:
            product.sizes?.M ??
            0,

          L:
            product.sizes?.L ??
            0,

          XL:
            product.sizes?.XL ??
            0,

          XXL:
            product.sizes?.XXL ??
            0,

          XXXL:
            product.sizes?.XXXL ??
            0,
        },
      });
    }
  }, []);

  const addColour = () => {
    const colour =
      newColour.trim();

    if (!colour) return;

    if (
      colours.some(
        (existingColour) =>
          existingColour.toLowerCase() ===
          colour.toLowerCase()
      )
    ) {
      alert(
        "This colour already exists."
      );
      return;
    }

    setColours((current) => [
      ...current,
      colour,
    ]);

    setStock((current) => ({
      ...current,
      [colour]: {
        M: 0,
        L: 0,
        XL: 0,
        XXL: 0,
        XXXL: 0,
      },
    }));

    setNewColour("");
  };

  const removeColour = (
    colour: string
  ) => {
    if (colours.length === 1) {
      alert(
        "At least one colour is required."
      );
      return;
    }

    setColours((current) =>
      current.filter(
        (item) => item !== colour
      )
    );

    setStock((current) => {
      const updated = {
        ...current,
      };

      delete updated[colour];

      return updated;
    });
  };

  const handleStockChange = (
    colour: string,
    size: (typeof sizes)[number],
    value: string
  ) => {
    setStock((current) => ({
      ...current,

      [colour]: {
        ...current[colour],

        [size]: Math.max(
          0,
          Number(value)
        ),
      },
    }));
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !productName ||
      !price ||
      !description ||
      images.length === 0
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    const savedProducts =
      localStorage.getItem(
        "eleganza-products"
      );

    const existingProducts =
      savedProducts
        ? JSON.parse(savedProducts)
        : [];

    const updatedProducts =
      existingProducts.map(
        (product: {
          name: string;
        }) => {
          if (
            product.name !==
            productName
          ) {
            return product;
          }

          return {
            ...product,

            name:
              productName.trim(),

            category,

            price:
              `₹${Number(
                price
              ).toLocaleString(
                "en-IN"
              )}`,

            image: images[0],

            images,

            description:
              description.trim(),

            colours,

            sizes: stock,
          };
        }
      );

    localStorage.setItem(
      "eleganza-products",
      JSON.stringify(
        updatedProducts
      )
    );

    const savedStock =
      localStorage.getItem(
        "eleganza-stock"
      );

    const existingStock =
      savedStock
        ? JSON.parse(savedStock)
        : {};

    const updatedStock = {
      ...existingStock,

      [productName]:
        stock,
    };

    localStorage.setItem(
      "eleganza-stock",
      JSON.stringify(
        updatedStock
      )
    );

    alert(
      "Product updated successfully! 🎉"
    );

    window.location.href =
      "/admin/orders";
  };

  return (
    <main className="add-product-page">

      <div className="add-product-container">

        {/* HEADER */}

        <div className="admin-header">

          <div>

            <p className="admin-small-heading">
              ELEGANZA BY MITTALI
            </p>

            <h1>
              Edit Product
            </h1>

          </div>

        </div>

        <form
          className="add-product-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* PRODUCT NAME */}

          <div className="form-group">

            <label>
              PRODUCT NAME *
            </label>

            <input
              type="text"
              value={
                productName
              }
              onChange={(e) =>
                setProductName(
                  e.target.value
                )
              }
            />

          </div>

          {/* CATEGORY + PRICE */}

          <div className="form-row">

            <div className="form-group">

              <label>
                CATEGORY *
              </label>

              <select
                value={
                  category
                }
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option>
                  Farshi Suit
                </option>

                <option>
                  Cord Set
                </option>

                <option>
                  Suit
                </option>

                <option>
                  Anarkali
                </option>

                <option>
                  Pakistani Suit
                </option>

                <option>
                  Sharara Set
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                PRICE *
              </label>

              <input
                type="number"
                value={
                  price
                }
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              DESCRIPTION *
            </label>

            <textarea
              value={
                description
              }
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
            />

          </div>

          {/* PRODUCT IMAGES */}

          <div className="form-group">

            <label>
              PRODUCT IMAGES *
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {

                const files =
                  Array.from(
                    e.target.files ||
                      []
                  );

                if (
                  files.length ===
                  0
                ) {
                  return;
                }

                Promise.all(
                  files.map(
                    (file) =>
                      new Promise<string>(
                        (
                          resolve
                        ) => {

                          const reader =
                            new FileReader();

                          reader.onloadend =
                            () => {

                              resolve(
                                reader.result as string
                              );

                            };

                          reader.readAsDataURL(
                            file
                          );

                        }
                      )
                  )
                ).then(
                  (
                    newImages
                  ) => {

                    setImages(
                      (
                        currentImages
                      ) => [
                        ...currentImages,
                        ...newImages,
                      ]
                    );

                  }
                );

              }}
            />

            {images.length >
              0 && (

              <div className="product-image-preview-grid">

                {images.map(
                  (
                    img,
                    index
                  ) => (

                    <div
                      className="product-image-preview"
                      key={index}
                    >

                      <img
                        src={img}
                        alt={`Product ${
                          index + 1
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => {

                          setImages(
                            (
                              currentImages
                            ) =>
                              currentImages.filter(
                                (
                                  _,
                                  imageIndex
                                ) =>
                                  imageIndex !==
                                  index
                              )
                          );

                        }}
                      >
                        ×
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* COLOURS */}

          <div className="form-group">

            <label>
              PRODUCT COLOURS
            </label>

            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                marginBottom:
                  "15px",
                flexWrap:
                  "wrap",
              }}
            >

              <input
                type="text"
                placeholder="e.g. Pink, Black, Green"
                value={
                  newColour
                }
                onChange={(e) =>
                  setNewColour(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {
                    e.preventDefault();
                    addColour();
                  }

                }}
              />

              <button
                type="button"
                onClick={
                  addColour
                }
                className="edit-product-btn"
              >
                + ADD COLOUR
              </button>

            </div>

            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                flexWrap:
                  "wrap",
              }}
            >

              {colours.map(
                (colour) => (

                  <div
                    key={colour}
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "8px",
                      padding:
                        "8px 12px",
                      border:
                        "1px solid #173847",
                      color:
                        "#173847",
                      fontSize:
                        "12px",
                      letterSpacing:
                        "0.8px",
                    }}
                  >

                    <span>
                      {colour}
                    </span>

                    {colours.length >
                      1 && (

                      <button
                        type="button"
                        onClick={() =>
                          removeColour(
                            colour
                          )
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          cursor:
                            "pointer",
                          fontSize:
                            "16px",
                          color:
                            "#173847",
                        }}
                      >
                        ×
                      </button>

                    )}

                  </div>

                )
              )}

            </div>

            <p
              style={{
                marginTop:
                  "10px",
                fontSize:
                  "12px",
                color:
                  "#777",
              }}
            >
              For a single-colour
              product, keep
              &quot;Default&quot;.
            </p>

          </div>

          {/* COLOUR + SIZE STOCK */}

          <div className="form-group">

            <label>
              COLOUR & SIZE-WISE STOCK *
            </label>

            {colours.map(
              (colour) => (

                <div
                  key={colour}
                  style={{
                    marginBottom:
                      "25px",
                  }}
                >

                  <h3
                    style={{
                      marginBottom:
                        "12px",
                      fontFamily:
                        "Georgia, serif",
                      fontWeight:
                        400,
                      color:
                        "#173847",
                    }}
                  >
                    {colour}
                  </h3>

                  <div className="add-product-stock-grid">

                    {sizes.map(
                      (size) => (

                        <div
                          className="add-product-stock-box"
                          key={`${colour}-${size}`}
                        >

                          <span>
                            {size}
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              stock[
                                colour
                              ]?.[
                                size
                              ] ?? 0
                            }
                            onChange={(
                              e
                            ) =>
                              handleStockChange(
                                colour,
                                size,
                                e.target
                                  .value
                              )
                            }
                          />

                        </div>

                      )
                    )}

                  </div>

                </div>

              )
            )}

          </div>

          {/* UPDATE */}

          <button
            type="submit"
            className="add-product-submit-btn"
          >
            UPDATE PRODUCT
          </button>

        </form>

      </div>

    </main>
  );
}