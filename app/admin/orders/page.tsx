"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

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
  paymentMethod: string;
};

type StockData = Record<
  string,
  Record<string, number> | Record<string, Record<string, number>>
>;

type SavedProduct = {
  name: string;
  category: string;
  price: string | number;
  images?: string[];
  image?: string;
  colours?: string[];
  sizes?:
    | Record<string, number>
    | Record<string, Record<string, number>>;
};


export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const searchParams = useSearchParams();

  const [highlightedOrder, setHighlightedOrder] =
    useState<string | null>(null);

  const [savedProducts, setSavedProducts] =
    useState<SavedProduct[]>([]);

    const [productColours, setProductColours] =
  useState<Record<string, string[]>>({});

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
  const loadOrders = async () => {
    const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  window.location.href = "/admin/login";
  return;
}

if (user.email !== "mittaligoyal2602@gmail.com") {
  await supabase.auth.signOut();
  window.location.href = "/admin/login";
  return;
}

  const { data: ordersData, error: ordersError } =
  await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

if (ordersError) {
  console.error(
    "Error loading orders:",
    ordersError
  );

  alert(
    `Orders error: ${ordersError.message}`
  );
} else if (ordersData) {
  const formattedOrders: Order[] =
    ordersData.map((order) => ({
      orderNumber: order.order_number,
      customer: {
        name: order.customer_name,
        mobile: order.customer_mobile,
        email: order.customer_email,
        address: order.address,
        area: order.area,
        city: order.city,
        pincode: order.pincode,
        state: order.state,
      },
      
    items: order.items || [],
total: Number(order.total),
date: new Date(
  order.created_at
).toLocaleString("en-IN"),
status: order.status || "Pending",
paymentMethod: order.payment_method || "cod",
    }));

  setOrders(formattedOrders);
}

  const {
  data: productsData,
  error: productsError,
} = await supabase
  .from("products")
  .select("name, colours, sizes")
  .order("id", { ascending: true });

if (productsError) {
  console.error(
    "Error loading inventory:",
    productsError
  );
} else if (productsData) {
  const formattedStock: StockData = {};

productsData.forEach((product) => {
  if (product.sizes) {
    formattedStock[product.name] =
      product.sizes;
  }
});

const formattedColours: Record<
  string,
  string[]
> = {};

productsData.forEach((product) => {
  if (
    product.colours &&
    Array.isArray(product.colours) &&
    product.colours.length > 0
  ) {
    formattedColours[product.name] =
      product.colours;
  }
});

setStockData(formattedStock);
setProductColours(formattedColours);

    if (productsData) {
  setSavedProducts(
    productsData as SavedProduct[]
  );
}
   };

   };

  loadOrders();
}, []);
useEffect(() => {
  const orderNumber =
    searchParams.get("order");

  if (!orderNumber || orders.length === 0) {
    return;
  }

  const matchingOrder = orders.find(
    (order) =>
      order.orderNumber === orderNumber
  );

  if (!matchingOrder) {
    return;
  }

  setHighlightedOrder(orderNumber);

  setTimeout(() => {
    const element =
      document.querySelector(
        `[data-order-number="${CSS.escape(
          orderNumber
        )}"]`
      );

    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 100);

  const timer = setTimeout(() => {
    setHighlightedOrder(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [searchParams, orders]);

  const updateOrderStatus = async (
  orderNumber: string,
  newStatus: string
) => {
  const { error } = await supabase
    .from("orders")
    .update({
      status: newStatus,
    })
    .eq("order_number", orderNumber);

  if (error) {
    console.error(
      "Error updating order status:",
      error
    );

    alert(
      "Could not update order status. Please try again."
    );

    return;
  }

  setOrders((currentOrders) =>
    currentOrders.map((order) =>
      order.orderNumber === orderNumber
        ? {
            ...order,
            status: newStatus,
          }
        : order
    )
  );
};

 const handleLogout = async () => {
  await supabase.auth.signOut();

  window.location.href =
    "/admin/login";
};

  const handleDeleteProduct = async (
  productName: string
) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${productName}"?`
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("name", productName);

  if (error) {
    console.error(
      "Error deleting product:",
      error
    );

    alert(
      "Could not delete product. Please try again."
    );

    return;
  }

  setSavedProducts((currentProducts) =>
    currentProducts.filter(
      (product) =>
        product.name !== productName
    )
  );

  setStockData((currentStock) => {
    const updatedStock = {
      ...currentStock,
    };

    delete updatedStock[productName];

    return updatedStock;
  });

  setProductColours((currentColours) => {
    const updatedColours = {
      ...currentColours,
    };

    delete updatedColours[productName];

    return updatedColours;
  });
};
  /*
   * Get colours for a product.
   * Old products automatically use Default.
   */
  const getProductColours = (
    productName: string
  ) => {
const supabaseColours =
  productColours[productName];

if (
  supabaseColours &&
  supabaseColours.length > 0
) {
  return supabaseColours;
}

const product = savedProducts.find(
  (item) => item.name === productName
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
const updateStock = async (
  productName: string,
  colour: string,
 size: string,
  change: number
) => {
  const productStock = stockData[productName];

  if (!productStock) return;

  let updatedProductStock;

  if (isColourWiseStock(productStock)) {
    const colourStock =
      productStock as Record<
        string,
        Record<string, number>
      >;

    const currentValue =
      colourStock[colour]?.[size] ?? 0;

    const newValue = Math.max(
      0,
      currentValue + change
    );

    updatedProductStock = {
      ...colourStock,
      [colour]: {
        ...colourStock[colour],
        [size]: newValue,
      },
    };
  } else {
    const oldStock =
      productStock as Record<string, number>;

    const currentValue =
      oldStock[size] ?? 0;

    updatedProductStock = {
      ...oldStock,
      [size]: Math.max(
        0,
        currentValue + change
      ),
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      sizes: updatedProductStock,
    })
    .eq("name", productName);

  if (error) {
    console.error(
      "Error updating stock:",
      error
    );

    alert(
      "Could not update stock. Please try again."
    );

    return;
  }

  setStockData((currentStock) => ({
    ...currentStock,
    [productName]: updatedProductStock,
  }));
};

  const getStockValue = (
    productName: string,
    colour: string,
    size: string
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

<nav className="admin-nav">
  <a href="/admin/dashboard">Dashboard</a>
  <a href="/admin/orders">Orders</a>
  <a href="/admin/products/add">Add Product</a>
  <a href="/admin/reviews">Reviews</a>
</nav>

  <span className="orders-count">
    {orders.length} Orders
  </span>

  <button
    className="admin-logout-btn"
    onClick={handleLogout}
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

                          {Object.keys(
                                isColourWiseStock(productStock)
                                  ? (
                                      productStock as Record<
                                        string,
                                        Record<string, number>
                                      >
                                    )[colour] || {}
                                  : (productStock as Record<string, number>)
                              ).map((size) => {

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
              className={`order-card ${
                highlightedOrder ===
                order.orderNumber
                  ? "highlighted-order"
                  : ""
              }`}
              key={order.orderNumber}
              data-order-number={order.orderNumber}
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
                    <strong>Payment:</strong>{" "}
                    {order.paymentMethod === "cod"
                     ? "COD"
                    : "Online Payment"}
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