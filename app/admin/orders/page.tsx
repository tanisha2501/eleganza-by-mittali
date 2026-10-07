"use client";

import { useEffect, useState } from "react";
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
  colour: string;
  size: string;
  quantity: number;
  price?: number | string;
}[];
  total: number;
  date: string;
  status: string;
  shiprocket_order_id?: number | null;
shiprocket_shipment_id?: number | null;
shiprocket_awb_code?: string | null;
shiprocket_courier_name?: string | null;
shiprocket_status?: string | null;
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

shiprocket_order_id: order.shiprocket_order_id,
shiprocket_shipment_id: order.shiprocket_shipment_id,
shiprocket_awb_code: order.shiprocket_awb_code,
shiprocket_courier_name: order.shiprocket_courier_name,
shiprocket_status: order.shiprocket_status,
shiprocket_tracking_url: order.shiprocket_tracking_url,
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
  new URLSearchParams(window.location.search).get("order");

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
},[orders]);
const handleShipNow = async (order: Order) => {
  try {
    if (order.shiprocket_order_id) {
      alert("This order is already shipped to Shiprocket.");
      return;
    }

    const orderItems = order.items.map((item) => ({
      name: item.name,
      sku: item.name
        .toLowerCase()
        .replace(/\s+/g, "-"),
      units: item.quantity,
      selling_price: Number(
        String(item.price || 0).replace(/[₹,]/g, "")
      ),
      discount: 0,
      tax: 0,
      hsn: "",
    }));

      const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Admin session expired. Please login again.");
      window.location.href = "/admin/login";
      return;
    }

    const response = await fetch("/api/shiprocket/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
        body: JSON.stringify({
          order_id: order.orderNumber,
          order_date: new Date().toISOString(),

          billing_customer_name:
            order.customer.name,

          billing_last_name: "",

          billing_address:
            order.customer.address,

          billing_city:
            order.customer.city,

          billing_pincode:
            order.customer.pincode,

          billing_state:
            order.customer.state,

          billing_country: "India",

          billing_email:
            order.customer.email,

          billing_phone:
            order.customer.mobile,

          shipping_is_billing: true,

          shipping_customer_name:
            order.customer.name,

          shipping_last_name: "",

          shipping_address:
            order.customer.address,

          shipping_city:
            order.customer.city,

          shipping_pincode:
            order.customer.pincode,

          shipping_state:
            order.customer.state,

          shipping_country: "India",

          shipping_email:
            order.customer.email,

          shipping_phone:
            order.customer.mobile,

          order_items: orderItems,

          payment_method:
            order.paymentMethod === "online"
              ? "Prepaid"
              : "COD",

          sub_total: Number(order.total),

          length: 20,
          breadth: 15,
          height: 10,
          weight: 0.5,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Shiprocket error:",
        result
      );

      alert(
        result.error ||
          "Shiprocket order creation failed."
      );

      return;
    }

  alert(
  "🚚 Shiprocket order created successfully! AWB will be assigned when shipping is arranged."
);
    // Update UI immediately
    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.orderNumber ===
        order.orderNumber
          ? {
              ...currentOrder,

              shiprocket_order_id:
                result.data
                  ?.shiprocket_order_id ?? null,

              shiprocket_shipment_id:
                result.data
                  ?.shiprocket_shipment_id ?? null,

              shiprocket_awb_code:
                result.data
                  ?.shiprocket_awb_code ?? null,

              shiprocket_courier_name:
                result.data
                  ?.shiprocket_courier_name ?? null,

              shiprocket_status:
                result.data
                  ?.shiprocket_status ?? null,
            }
          : currentOrder
      )
    );
  } catch (error) {
    console.error(
      "Ship Now error:",
      error
    );

    alert(
      "Something went wrong while shipping the order."
    );
  }
};
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
                  <div className="admin-shipping-info">
  <h3>Shipping Details</h3>

  <p>
    <strong>Shiprocket Order ID:</strong>{" "}
    {order.shiprocket_order_id || "Not assigned"}
  </p>

  <p>
    <strong>Shipment ID:</strong>{" "}
    {order.shiprocket_shipment_id || "Not assigned"}
  </p>

  <p>
    <strong>Tracking ID / AWB:</strong>{" "}
    {order.shiprocket_awb_code || "Not assigned"}
  </p>

  <p>
    <strong>Courier:</strong>{" "}
    {order.shiprocket_courier_name || "Not assigned"}
  </p>

  <p>
    <strong>Shipping Status:</strong>{" "}
    {order.shiprocket_status || "NEW"}
  </p>
  
  {!order.shiprocket_order_id && (
  <button
    onClick={() => handleShipNow(order)}
    className="admin-ship-now-btn"
  >
    🚚 SHIP NOW
  </button>
)}

  {order.shiprocket_awb_code && (
    <a
      href={`https://www.shiprocket.in/shipment-tracking/?awb=${encodeURIComponent(
        order.shiprocket_awb_code
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      className="admin-track-order-btn"
    >
      TRACK SHIPMENT →
    </a>
  )}
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