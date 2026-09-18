"use client";

import { useState } from "react";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Farshi Suit");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [colours, setColours] = useState<string[]>([
    "Default",
  ]);

  const [newColour, setNewColour] = useState("");

  const [stock, setStock] = useState<
    Record<string, Record<string, number>>
  >({
    Default: {
      M: 10,
      L: 10,
      XL: 10,
      XXL: 10,
      XXXL: 10,
    },
  });

  const sizes = [
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
  ] as const;

  const addColour = () => {
    const colour = newColour.trim();

    if (!colour) return;

    if (
      colours.some(
        (existingColour) =>
          existingColour.toLowerCase() ===
          colour.toLowerCase()
      )
    ) {
      alert("This colour already exists.");
      return;
    }

    setColours((current) => [
      ...current,
      colour,
    ]);

    setStock((current) => ({
      ...current,
      [colour]: {
        M: 10,
        L: 10,
        XL: 10,
        XXL: 10,
        XXXL: 10,
      },
    }));

    setNewColour("");
  };

  const removeColour = (colour: string) => {
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
      const updated = { ...current };
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
        [size]: Math.max(0, Number(value)),
      },
    }));
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !name ||
      !price ||
      !description ||
      images.length === 0
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    const newProduct = {
      name: name.trim(),
      category,
      price: `₹${Number(price).toLocaleString(
        "en-IN"
      )}`,
      image: images[0],
      images: images,
      description: description.trim(),
      colours,
      sizes: stock,
    };

    const savedProducts =
      localStorage.getItem(
        "eleganza-products"
      );

    const existingProducts = savedProducts
      ? JSON.parse(savedProducts)
      : [];

    const updatedProducts = [
      ...existingProducts,
      newProduct,
    ];

    localStorage.setItem(
      "eleganza-products",
      JSON.stringify(updatedProducts)
    );

    const existingStock = JSON.parse(
      localStorage.getItem(
        "eleganza-stock"
      ) || "{}"
    );

    localStorage.setItem(
      "eleganza-stock",
      JSON.stringify({
        ...existingStock,
        [newProduct.name]: stock,
      })
    );

    alert(
      "Product added successfully! 🎉"
    );

    window.location.href =
      "/admin/orders";
  };

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-container">

        <div className="admin-header">
          <div>
            <p className="admin-small-heading">
              ELEGANZA BY MITTALI
            </p>

            <h1>Add New Product</h1>
          </div>

          <button
            className="admin-logout-btn"
            onClick={() => {
              window.location.href =
                "/admin/orders";
            }}
          >
            BACK TO ADMIN
          </button>
        </div>

        <form
          className="add-product-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label>PRODUCT NAME *</label>

            <input
              type="text"
              placeholder="e.g. Rose Gold Anarkali"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>CATEGORY *</label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              >
                <option value="Farshi Suit">
                  Farshi Suit
                </option>

                <option value="Cord Set">
                  Cord Set
                </option>

                <option value="Suit">
                  Suit
                </option>

                <option value="Anarkali">
                  Anarkali
                </option>

                <option value="Pakistani Suit">
                  Pakistani Suit
                </option>

                <option value="Sharara Set">
                  Sharara Set
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>PRICE *</label>

              <input
                type="number"
                placeholder="4999"
                min="0"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />
            </div>

          </div>

          <div className="form-group">
            <label>PRODUCT IMAGES *</label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(
                  e.target.files || []
                );

                if (files.length === 0)
                  return;

                Promise.all(
                  files.map(
                    (file) =>
                      new Promise<string>(
                        (resolve) => {
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
                ).then((newImages) => {
                  setImages(
                    (currentImages) => [
                      ...currentImages,
                      ...newImages,
                    ]
                  );
                });
              }}
            />

            {images.length > 0 && (
              <div className="product-image-preview-grid">
                {images.map(
                  (img, index) => (
                    <div
                      className="product-image-preview"
                      key={index}
                    >
                      <img
                        src={img}
                        alt={`Product preview ${
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

          <div className="form-group">
            <label>DESCRIPTION *</label>

            <textarea
              placeholder="Enter product description..."
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          {/* COLOURS */}
          <div className="form-group">
            <label>PRODUCT COLOURS</label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "15px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="e.g. Pink, Black, Green"
                value={newColour}
                onChange={(e) =>
                  setNewColour(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColour();
                  }
                }}
              />

              <button
                type="button"
                onClick={addColour}
                className="edit-product-btn"
              >
                + ADD COLOUR
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {colours.map((colour) => (
                <div
                  key={colour}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    border:
                      "1px solid #173847",
                    color: "#173847",
                    fontSize: "12px",
                    letterSpacing:
                      "0.8px",
                  }}
                >
                  <span>{colour}</span>

                  {colours.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeColour(
                          colour
                        )
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        cursor: "pointer",
                        fontSize:
                          "16px",
                        color: "#173847",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#777",
              }}
            >
              If the product has only one
              colour, keep &quot;Default&quot;.
            </p>
          </div>

          {/* COLOUR-WISE SIZE STOCK */}
          <div className="form-group">
            <label>
              COLOUR & SIZE-WISE STOCK
            </label>

            {colours.map((colour) => (
              <div
                key={colour}
                style={{
                  marginBottom: "25px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "12px",
                    fontFamily:
                      "Georgia, serif",
                    fontWeight: 400,
                    color: "#173847",
                  }}
                >
                  {colour}
                </h3>

                <div className="add-product-stock-grid">
                  {sizes.map((size) => (
                    <div
                      className="add-product-stock-box"
                      key={`${colour}-${size}`}
                    >
                      <span>{size}</span>

                      <input
                        type="number"
                        min="0"
                        value={
                          stock[colour]?.[
                            size
                          ] ?? 0
                        }
                        onChange={(e) =>
                          handleStockChange(
                            colour,
                            size,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="add-product-submit-btn"
          >
            SAVE PRODUCT
          </button>

        </form>

      </div>
    </main>
  );
}