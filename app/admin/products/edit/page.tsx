"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";


export default function EditProductPage() {
  const [productName, setProductName] =
    useState("");

  const [category, setCategory] =
  useState("Farshi Sets");

  const [price, setPrice] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [colours, setColours] =
    useState<string[]>(["Default"]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [newSize, setNewSize] = useState("");

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
  const loadProduct = async () => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const name = params.get("name");

    if (!name) return;

    const { data: product, error } =
  await supabase
    .from("products")
    .select("*")
    .eq("name", name)
    .single();

if (error || !product) {
  console.error(
    "Error loading product:",
    error
  );

  alert("Product could not be loaded.");
  return;
}

    setProductName(product.name);

    setCategory(product.category);

  setPrice(
  String(product.price).replace(
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

const productSizes = product.sizes;

if (
  productSizes &&
  typeof productSizes === "object"
) {
  const allSizes = Array.from(
  new Set(
    Object.values(productSizes).flatMap(
      (colourStock) =>
        Object.keys(
          colourStock as Record<string, number>
        )
    )
  )
);

setSizes(allSizes);
  const firstValue =
    Object.values(productSizes)[0];

  if (
    firstValue &&
    typeof firstValue === "object"
  ) {
    setStock(
      productSizes as Record<
        string,
        Record<string, number>
      >
    );
  } else {
    setStock({
      Default: {
        M:
          Number(
            (productSizes as Record<string, number>).M
          ) || 0,
        L:
          Number(
            (productSizes as Record<string, number>).L
          ) || 0,
        XL:
          Number(
            (productSizes as Record<string, number>).XL
          ) || 0,
        XXL:
          Number(
            (productSizes as Record<string, number>).XXL
          ) || 0,
        XXXL:
          Number(
            (productSizes as Record<string, number>).XXXL
          ) || 0,
      },
    });
  }
       }
  };

  loadProduct();
}, []);

  const addColour = () => {
    const colour = newColour.trim();

    if (!colour) return;

    if (colours.includes(colour)) {
      alert("This colour already exists.");
      return;
    }

    setColours((prev) => [...prev, colour]);

    setStock((prev) => ({
      ...prev,
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

  const removeColour = (colourToRemove: string) => {
    if (colours.length === 1) return;

    setColours((prev) =>
      prev.filter((colour) => colour !== colourToRemove)
    );

    setStock((prev) => {
      const updated = { ...prev };
      delete updated[colourToRemove];
      return updated;
    });
  };

  const handleStockChange = (
    colour: string,
    size: string,
    value: string
  ) => {
    const numericValue = Math.max(
      0,
      Number(value) || 0
    );

    setStock((prev) => ({
      ...prev,
      [colour]: {
        ...prev[colour],
        [size]: numericValue,
      },
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const originalName = new URLSearchParams(
      window.location.search
    ).get("name");

    if (!originalName) {
      alert("Product could not be identified.");
      return;
    }

    const slug = productName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { error } = await supabase
      .from("products")
      .update({
        name: productName.trim(),
        slug,
        category,
        price: Number(price),
        description,
        image: images[0] || "",
        images,
        colours,
        sizes: stock,
      })
      .eq("name", originalName);

    if (error) {
      console.error(
        "Error updating product:",
        error
      );
      alert(
        "Product update failed. Please try again."
      );
      return;
    }

    alert("Product updated successfully!");
    window.location.href = "/admin/orders";
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
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="Farshi Sets">
                Farshi Sets
              </option>

              <option value="Cord Sets">
                Cord Sets
              </option>

              <option value="Suits">
                Suits
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
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);

              if (files.length === 0) return;

              try {
                const uploadedImages: string[] = [];

                for (const file of files) {
                  const fileExt = file.name.split(".").pop();
                  const fileName = `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 10)}.${fileExt}`;

                  const filePath = `products/${fileName}`;

                  const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, file, {
                      cacheControl: "3600",
                      upsert: false,
                    });
                    
                  if (uploadError) {
                    console.error("Image upload error:", uploadError);
                    alert("Image upload failed. Please try again.");
                    return;
                  }

                  const { data } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(filePath);

                  if (data.publicUrl) {
                    uploadedImages.push(data.publicUrl);
                  }
                }

                setImages((currentImages) => [
                  ...currentImages,
                  ...uploadedImages,
                ]);
              } catch (error) {
                console.error("Image upload error:", error);
                alert("Image upload failed. Please try again.");
              } finally {
                e.target.value = "";
              }
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