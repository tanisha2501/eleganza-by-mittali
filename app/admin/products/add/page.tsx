"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";

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

  const [sizes, setSizes] = useState<string[]>([
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
]);

const [newSize, setNewSize] = useState("");

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

  setColours((current) => {
  if (
    current.length === 1 &&
    current[0] === "Default"
  ) {
    return [colour];
  }

  return [...current, colour];
});

setStock((current) => {
  const updatedStock = { ...current };

  if (
    colours.length === 1 &&
    colours[0] === "Default"
  ) {
    delete updatedStock.Default;
  }

updatedStock[colour] = {};

sizes.forEach((size) => {
  updatedStock[colour][size] = 0;
});

  return updatedStock;
});
    setNewColour("");
  };
  const addSize = () => {
  const size = newSize.trim();

  if (!size) return;

  if (
    sizes.some(
      (existingSize) =>
        existingSize.toLowerCase() === size.toLowerCase()
    )
  ) {
    alert("This size already exists.");
    return;
  }

  setSizes((current) => [...current, size]);

  setStock((current) => {
    const updatedStock = { ...current };

    colours.forEach((colour) => {
      updatedStock[colour] = {
        ...(updatedStock[colour] || {}),
        [size]: 0,
      };
    });

    return updatedStock;
  });

  setNewSize("");
};

const removeSize = (sizeToRemove: string) => {
  if (sizes.length === 1) {
    alert("At least one size is required.");
    return;
  }

  setSizes((current) =>
    current.filter((size) => size !== sizeToRemove)
  );

  setStock((current) => {
    const updatedStock = { ...current };

    Object.keys(updatedStock).forEach((colour) => {
      const colourStock = {
        ...updatedStock[colour],
      };

      delete colourStock[sizeToRemove];

      updatedStock[colour] = colourStock;
    });

    return updatedStock;
  });
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
   size: string,
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
const uploadImageToStorage = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error);
    throw error;
  }

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

  const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (
    !name ||
    !price ||
    !description ||
    images.length === 0
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { error } = await supabase
    .from("products")
    .insert([
      {
        name: name.trim(),
        slug,
        category,
        price: Number(price),
        description: description.trim(),
        image: images[0],
        images,
        colours,
        sizes: stock,
      },
    ]);

  if (error) {
    console.error("Error adding product:", error);
    alert("Product could not be added. Please try again.");
    return;
  }

  alert("Product added successfully! 🎉");

  window.location.href = "/admin/orders";
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
    onChange={async (e) => {
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  try {
    const uploadedImages = await Promise.all(
      files.map((file) => uploadImageToStorage(file))
    );

    setImages((currentImages) => [
      ...currentImages,
      ...uploadedImages,
    ]);
  } catch (error) {
    console.error("Image upload failed:", error);
    alert("Image upload failed. Please try again.");
  }

  e.target.value = "";
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
          {/* PRODUCT SIZES */}

<div className="form-group">

  <label>PRODUCT SIZES</label>

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
      placeholder="e.g. S, M, L, Free Size, 36"
      value={newSize}
      onChange={(e) => setNewSize(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addSize();
        }
      }}
    />

    <button
      type="button"
      onClick={addSize}
      className="edit-product-btn"
    >
      + ADD SIZE
    </button>
  </div>

  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    }}
  >
    {sizes.map((size) => (
      <div
        key={size}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          border: "1px solid #173847",
          color: "#173847",
          fontSize: "12px",
          letterSpacing: "0.8px",
        }}
      >
        <span>{size}</span>

        {sizes.length > 1 && (
          <button
            type="button"
            onClick={() => removeSize(size)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
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
        Add only the sizes available for this product.
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