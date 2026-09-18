"use client";

import { useEffect, useState } from "react";

type Order = {
  orderNumber: string;
  customer: {
    name: string;
    mobile: string;
    email: string;
    address: string;
    area: string;
    city: string;
    pincode: string;
    state: string;
  };
  items: {
    name: string;
    colour?: string;
    size: string;
    quantity: number;
  }[];
  total: number;
  date: string;
  status: string;
};

type StockData = Record<
  string,
  Record<string, number> | Record<string, Record<string, number>>
>;

type SavedProduct = {
  name: string;
  category: string;
  price: string;
  images: string[];
  colours?: string[];
  sizes?: Record<string, number>;
};

const sizes = [
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [savedProducts, setSavedProducts] =
    useState<SavedProduct[]>([]);

  const [stockData, setStockData] =
    useState<StockData>({
      "The Royal Farshi": {
        M: 10,
        L: 10,
        XL: 10,
        XXL: 10,
        XXXL: 10,
      },

      "Blush Cord Set": {
        M: 10,
        L: 10,
        XL: 10,
        XXL: 10,
        XXXL: 10,
      },

      "Ivory Elegance": {
        M: 10,
        L: 10,
        XL: 10,
        XXL: 10,
        XXXL: 10,
      },

      "Midnight Anarkali": {
        M: 10,
        L: 10,
        XL: 10,
        XXL: 10,
        XXXL: 10,
      },
    });

  useEffect(() => {
    const isAdmin =
      localStorage.getItem(
        "eleganza-admin"
      );

    if (isAdmin !== "true") {
      window.location.href =
        "/admin/login";
      return;
    }

    const savedOrders =
      localStorage.getItem(
        "eleganza-orders"
      );

    if (savedOrders) {
      setOrders(
        JSON.parse(savedOrders)
      );
    }

    const savedStock =
      localStorage.getItem(
        "eleganza-stock"
      );

    if (savedStock) {
      setStockData(
        JSON.parse(savedStock)
      );
    }

    const savedProductsData =
      localStorage.getItem(
        "eleganza-products"
      );

    if (savedProductsData) {
      setSavedProducts(
        JSON.parse(savedProductsData)
      );
    }
  }, []);

  const updateOrderStatus = (
    orderNumber: string,
    newStatus: string
  ) => {
    setOrders((currentOrders) => {
      const updatedOrders =
        currentOrders.map(
          (order) =>
            order.orderNumber ===
            orderNumber
              ? {
                  ...order,
                  status: newStatus,
                }
              : order
        );

      localStorage.setItem(
        "eleganza-orders",
        JSON.stringify(
          updatedOrders
        )
      );

      return updatedOrders;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "eleganza-admin"
    );

    window.location.href =
      "/admin/login";
  };

  const handleDeleteProduct = (
    productName: string
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${productName}"?`
      );

    if (!confirmed) return;

    const updatedProducts =
      savedProducts.filter(
        (product) =>
          product.name !==
          productName
      );

    setSavedProducts(
      updatedProducts
    );

    localStorage.setItem(
      "eleganza-products",
      JSON.stringify(
        updatedProducts
      )
    );

    const updatedStock = {
      ...stockData,
    };

    delete updatedStock[
      productName
    ];

    setStockData(
      updatedStock
    );

    localStorage.setItem(
      "eleganza-stock",
      JSON.stringify(
        updatedStock
      )
    );
  };

  /*
   * Get colours for a product.
   * Old products automatically use Default.
   */
  const getProductColours = (
    productName: string
  ) => {
    const product =
      savedProducts.find(
        (item) =>
          item.name ===
          productName
      );

    if (
      product?.colours &&
      product.colours.length > 0
    ) {
      return product.colours;
    }

    return ["Default"];
  };

  /*
   * Check whether stock is colour-wise
   * or old size-only format.
   */
  const isColourWiseStock = (
    stock: StockData[string]
  ) => {
    if (!stock) return false;

    const firstValue =
      Object.values(stock)[0];

    return (
      typeof firstValue ===
      "object"
    );
  };

  /*
   * Update colour + size stock
   */
  const updateStock = (
    productName: string,
    colour: string,
    size: (typeof sizes)[number],
    change: number
  ) => {
    setStockData(
      (currentStock) => {
        const productStock =
          currentStock[
            productName
          ];

        if (!productStock) {
          return currentStock;
        }

        let updatedProductStock;

        if (
          isColourWiseStock(
            productStock
          )
        ) {
          const colourStock =
            productStock as Record<
              string,
              Record<string, number>
            >;

          const currentValue =
            colourStock[
              colour
            ]?.[size] ?? 0;

          updatedProductStock = {
            ...colourStock,
            [colour]: {
              ...colourStock[
                colour
              ],
              [size]: Math.max(
                0,
                currentValue +
                  change
              ),
            },
          };
        } else {
          /*
           * Old product:
           * treat it as Default colour
           */
          const oldStock =
            productStock as Record<
              string,
              number
            >;

          const currentValue =
            oldStock[size] ?? 0;

          updatedProductStock = {
            ...oldStock,
            [size]: Math.max(
              0,
              currentValue +
                change
            ),
          };
        }

        const updatedStock = {
          ...currentStock,
          [productName]:
            updatedProductStock,
        };

        localStorage.setItem(
          "eleganza-stock",
          JSON.stringify(
            updatedStock
          )
        );

        return updatedStock;
      }
    );
  };

  const getStockValue = (
    productName: string,
    colour: string,
    size: (typeof sizes)[number]
  ) => {
    const productStock =
      stockData[productName];

    if (!productStock) {
      return 0;
    }

    if (
      isColourWiseStock(
        productStock
      )
    ) {
      const colourStock =
        productStock as Record<
          string,
          Record<string, number>
        >;

      return (
        colourStock[
          colour
        ]?.[size] ?? 0
      );
    }

    /*
     * Old size-only stock
     */
    const oldStock =
      productStock as Record<
        string,
        number
      >;

    return oldStock[size] ?? 0;
  };

  const totalOrders =
    orders.length;

  const totalSales =
    orders.reduce(
      (sum, order) =>
        sum + order.total,
      0
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Pending"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "Shipped"
    ).length;

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-container">

        {/* HEADER */}

        <div className="admin-header">
          <div>
            <p className="admin-small-heading">
              ELEGANZA BY MITTALI
            </p>

            <h1>Orders</h1>
          </div>

          <span className="orders-count">
            {orders.length} Orders
          </span>

          <button
            className="admin-logout-btn"
            onClick={
              handleLogout
            }
          >
            LOGOUT
          </button>
        </div>

        {/* STATS */}

        <div className="admin-stats">

          <div className="admin-stat-card">
            <span>
              Total Orders
            </span>

            <strong>
              {totalOrders}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              Total Sales
            </span>

            <strong>
              ₹
              {totalSales.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              Pending Orders
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>
              Shipped Orders
            </span>

            <strong>
              {shippedOrders}
            </strong>
          </div>

        </div>

        {/* INVENTORY */}

        <div className="inventory-section">

          <div className="inventory-header">

            <div>
              <p className="admin-small-heading">
                INVENTORY
              </p>

              <h2>
                Stock Management
              </h2>
            </div>

            <button
              className="add-product-btn"
              onClick={() => {
                window.location.href =
                  "/admin/products/add";
              }}
            >
              + ADD NEW PRODUCT
            </button>

          </div>

          <div className="inventory-list">

            {Object.entries(
              stockData
            ).map(
              ([
                productName,
                productStock,
              ]) => {

                const colours =
                  getProductColours(
                    productName
                  );

                return (
                  <div
                    className="inventory-item"
                    key={
                      productName
                    }
                  >

                    <div className="inventory-product-name">
                      <h3>
                        {productName}
                      </h3>
                    </div>

                    <div
                      style={{
                        width:
                          "100%",
                      }}
                    >

                      {colours.map(
                        (colour) => (
                          <div
                            key={
                              colour
                            }
                            style={{
                              marginBottom:
                                "22px",
                            }}
                          >

                            <h4
                              style={{
                                margin:
                                  "0 0 12px",
                                fontFamily:
                                  "Georgia, serif",
                                fontWeight:
                                  400,
                                color:
                                  "#173847",
                                fontSize:
                                  "18px",
                              }}
                            >
                              {colour}
                            </h4>

                            <div className="inventory-size-list">

                              {sizes.map(
                                (
                                  size
                                ) => {

                                  const currentSizeStock =
                                    getStockValue(
                                      productName,
                                      colour,
                                      size
                                    );

                                  return (
                                    <div
                                      className="inventory-size-row"
                                      key={`${productName}-${colour}-${size}`}
                                    >

                                      <span className="inventory-size-label">
                                        {size}
                                      </span>

                                      <div className="inventory-controls">

                                        <button
                                          onClick={() =>
                                            updateStock(
                                              productName,
                                              colour,
                                              size,
                                              -1
                                            )
                                          }
                                          disabled={
                                            currentSizeStock <=
                                            0
                                          }
                                        >
                                          −
                                        </button>

                                        <strong>
                                          {
                                            currentSizeStock
                                          }
                                        </strong>

                                        <button
                                          onClick={() =>
                                            updateStock(
                                              productName,
                                              colour,
                                              size,
                                              1
                                            )
                                          }
                                        >
                                          +
                                        </button>

                                      </div>

                                    </div>
                                  );
                                }
                              )}

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* PRODUCT MANAGEMENT */}

        <div className="inventory-section">

          <div className="inventory-header">

            <div>
              <p className="admin-small-heading">
                PRODUCTS
              </p>

              <h2>
                Product Management
              </h2>
            </div>

          </div>

          <div className="inventory-list">

            {savedProducts.length ===
            0 ? (
              <p>
                No additional products
                have been added yet.
              </p>
            ) : (
              savedProducts.map(
                (product) => (
                  <div
                    className="inventory-item"
                    key={
                      product.name
                    }
                  >

                    <div className="inventory-product-name">

                      <h3>
                        {product.name}
                      </h3>

                      <p>
                        {product.category}
                      </p>

                    </div>

                    <div>
                      <strong>
                        {product.price}
                      </strong>
                    </div>

                    <button
                      className="edit-product-btn"
                      onClick={() => {
                        window.location.href =
                          `/admin/products/edit?name=${encodeURIComponent(
                            product.name
                          )}`;
                      }}
                    >
                      EDIT
                    </button>

                    <button
                      className="delete-product-btn"
                      onClick={() =>
                        handleDeleteProduct(
                          product.name
                        )
                      }
                    >
                      DELETE
                    </button>

                  </div>
                )
              )
            )}

            <button
              className="add-product-btn"
              onClick={() => {
                window.location.href =
                  "/admin/products/add";
              }}
            >
              + ADD NEW PRODUCT
            </button>

          </div>

        </div>

        {/* ORDERS */}

        {orders.length ===
        0 ? (
          <div className="no-orders">

            <h2>
              No Orders Yet
            </h2>

            <p>
              Customer orders will
              appear here once they
              are placed.
            </p>

          </div>
        ) : (
          <div className="orders-list">

            {orders.map(
              (order) => (
                <div
                  className="order-card"
                  key={
                    order.orderNumber
                  }
                >

                  <div className="order-card-header">

                    <div>

                      <p className="order-label">
                        ORDER NUMBER
                      </p>

                      <h2>
                        {
                          order.orderNumber
                        }
                      </h2>

                    </div>

                    <select
                      className="order-status-select"
                      value={
                        order.status
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order.orderNumber,
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Confirmed">
                        Confirmed
                      </option>

                      <option value="Shipped">
                        Shipped
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>
                    </select>

                  </div>

                  <div className="order-details">

                    <div className="customer-details">

                      <h3>
                        Customer
                      </h3>

                      <p>
                        <strong>
                          {
                            order
                              .customer
                              .name
                          }
                        </strong>
                      </p>

                      <p>
                        {
                          order
                            .customer
                            .mobile
                        }
                      </p>

                      <p>
                        {
                          order
                            .customer
                            .email
                        }
                      </p>

                      <p>
                        {
                          order
                            .customer
                            .address
                        }
                        ,{" "}
                        {
                          order
                            .customer
                            .area
                        }
                        ,{" "}
                        {
                          order
                            .customer
                            .city
                        }
                        ,{" "}
                        {
                          order
                            .customer
                            .pincode
                        }
                        ,{" "}
                        {
                          order
                            .customer
                            .state
                        }
                      </p>

                    </div>

                    <div className="ordered-products">

                      <h3>
                        Products
                      </h3>

                      {order.items.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            className="admin-product"
                            key={`${item.name}-${item.colour || "Default"}-${item.size}-${index}`}
                          >

                            <span>
                              {
                                item.name
                              }
                            </span>

                            <span>
                              Colour:{" "}
                              {item.colour ||
                                "Default"}
                            </span>

                            <span>
                              Size:{" "}
                              {
                                item.size
                              }
                            </span>

                            <span>
                              Qty:{" "}
                              {
                                item.quantity
                              }
                            </span>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                  <div className="order-card-footer">

                    <span>
                      {
                        order.date
                      }
                    </span>

                    <strong>
                      ₹
                      {order.total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}