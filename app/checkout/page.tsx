"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { products as defaultProducts } from "../lib/products";
import { supabase } from "../lib/supabase";


declare global {
  interface Window {
    Razorpay: any;
  }
}

type CartItem = {
  name: string;
  colour?: string;
  size: string;
  quantity: number;
};
type Product = {
  name: string;
  category: string;
  price: string | number;
  image?: string;
  images?: string[];
  description: string;
  colours?: string[];
  sizes?:
    | Record<string, number>
    | Record<string, Record<string, number>>;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
const [allProducts, setAllProducts] =
  useState<Product[]>(defaultProducts);
  const [customerName, setCustomerName] = useState("");
const [mobile, setMobile] = useState("");
const [email, setEmail] = useState("");
const [address, setAddress] = useState("");
const [area, setArea] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");
const [state, setState] = useState("");
const [paymentMethod, setPaymentMethod] =
  useState<"online" | "cod">("online");

  useEffect(() => {
  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      localStorage.setItem(
        "eleganza-checkout-redirect",
        "true"
      );

      window.location.href = "/login";
    }
  };

  checkAuth();
}, []);

useEffect(() => {
const loadCheckoutData = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    localStorage.setItem(
      "eleganza-checkout-redirect",
      "true"
    );

    window.location.href = "/login";
    return;
  }

  const savedCart =
    localStorage.getItem("eleganza-cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "Error loading products:",
        error
      );
      setAllProducts(defaultProducts);
      return;
    }

    if (data && data.length > 0) {
      setAllProducts(data);
    } else {
      setAllProducts(defaultProducts);
    }
  };

  loadCheckoutData();
}, []);

const total = cart.reduce((sum, item) => {
 const product = allProducts.find(
  (p) => p.name === item.name
);

  if (!product) return sum;

 const price =
  typeof product.price === "number"
    ? product.price
    : Number(
        product.price
          .replace("₹", "")
          .replace(/,/g, "")
      );

  return sum + price * item.quantity;
}, 0);
const createShiprocketOrder = async (orderNumber: string) => {
  const orderItems = cart.map((item) => {
    const product = allProducts.find((p) => p.name === item.name);

    const price = product
      ? typeof product.price === "number"
        ? product.price
        : Number(
            product.price
              .replace("₹", "")
              .replace(/,/g, "")
          )
      : 0;

    return {
      name: item.name,
      sku: item.name
        .toLowerCase()
        .replace(/\s+/g, "-"),
      units: item.quantity,
      selling_price: price,
      discount: 0,
      tax: 0,
      hsn: "",
    };
  });

 const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  alert("Please login again.");
  return;
}

const response = await fetch("/api/shiprocket/create-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  },
    body: JSON.stringify({
      order_id: orderNumber,
      order_date: new Date().toISOString(),

      billing_customer_name: customerName,
      billing_last_name: "",
      billing_address: `${address}, ${area}`,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: "India",
      billing_email: email,
      billing_phone: mobile,

      shipping_is_billing: true,

      shipping_customer_name: customerName,
      shipping_last_name: "",
      shipping_address: `${address}, ${area}`,
      shipping_city: city,
      shipping_pincode: pincode,
      shipping_state: state,
      shipping_country: "India",
      shipping_email: email,
      shipping_phone: mobile,

      order_items: orderItems,

      payment_method:
        paymentMethod === "online"
          ? "Prepaid"
          : "COD",

      sub_total: total,

      length: 20,
      breadth: 15,
      height: 10,
      weight: 0.5,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    console.error(
      "Shiprocket order failed:",
      result
    );

    throw new Error(
      result.error ||
        "Shiprocket order creation failed"
    );
  }

  return result;
};
const handlePlaceOrder = async () => {
  if (
    !customerName ||
    !mobile ||
    !email ||
    !address ||
    !area ||
    !city ||
    !pincode ||
    !state
  ) {
    alert("Please fill in all your details.");
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    if (paymentMethod === "online") {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Please login again.");
      return;
    }

    const razorpayResponse = await fetch(
      "/api/razorpay/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
          body: JSON.stringify({
            items: cart,
          }),
        }
      );

      const razorpayResult = await razorpayResponse.json();

      if (!razorpayResponse.ok) {
        alert(
          razorpayResult.error ||
            "Unable to start online payment."
        );
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayResult.amount,
        currency: razorpayResult.currency,
        name: "Eleganza by Mittali",
        description: "Fashion Order",
        order_id: razorpayResult.orderId,

        prefill: {
          name: customerName,
          email: email,
          contact: mobile,
        },

        theme: {
          color: "#d16b86",
        },

        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          alert("Please login again.");
          return;
        }

        const orderResponse = await fetch(
          "/api/orders",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
                body: JSON.stringify({
                  customer_name: customerName,
                  customer_email: email,
                  customer_mobile: mobile,
                  address: address,
                  area: area,
                  city: city,
                  pincode: pincode,
                  state: state,
                  items: cart,
                  payment_method: "online",
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                  razorpay_order_id:
                    response.razorpay_order_id,
                  razorpay_signature:
                    response.razorpay_signature,
                }),
              }
            );

            const orderResult =
              await orderResponse.json();

            if (!orderResponse.ok) {
              alert(
                orderResult.error ||
                  "Payment succeeded but order creation failed. Please contact support."
              );
              return;
            }

            const orderNumber =
              orderResult.order?.order_number ||
              orderResult.order_number;


            localStorage.setItem(
              "eleganza-last-order",
              orderNumber
            );


            localStorage.removeItem(
              "eleganza-cart"
            );

            alert(
              "Payment successful and order placed! 🎉"
            );

            window.location.href =
              "/order-success";
          } catch (error) {
            console.error(
              "Online order error:",
              error
            );

            alert(
              "Payment was successful, but we could not create the order. Please contact support."
            );
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay payment window closed."
            );
          },
        },
      };

      if (
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      ) {
        alert(
          "Razorpay is not configured correctly."
        );
        return;
      }

   const razorpay = new window.Razorpay(options);

      razorpay.open();

      return;
    }

      const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Please login again.");
      return;
    }

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        customer_name: customerName,
        customer_email: email,
        customer_mobile: mobile,
        address: address,
        area: area,
        city: city,
        pincode: pincode,
        state: state,
        items: cart,
        payment_method: "cod",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(
        result.error ||
          "Order could not be placed. Please try again."
      );
      return;
    }

    const orderNumber =
      result.order?.order_number ||
      result.order_number;


    localStorage.setItem(
      "eleganza-last-order",
      orderNumber
    );

    localStorage.removeItem(
      "eleganza-cart"
    );

    alert("Order placed successfully! 🎉");

    window.location.href =
      "/order-success";
  } catch (error) {
    console.error("Order error:", error);

    alert(
      "Something went wrong while placing your order."
    );
  }
};
  return (
    <main className="checkout-page">
      <Script
  src="https://checkout.razorpay.com/v1/checkout.js"
  strategy="afterInteractive"
/>

      <div className="checkout-container">

        <div className="checkout-left">

          <p className="checkout-small-heading">
            ELEGANZA BY MITTALI
          </p>

          <h1>Checkout</h1>

          <section className="checkout-section">
            <h2>Contact Information</h2>

           <input
            type="text"
            placeholder="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
                />
        
        <input
        type="tel"
        placeholder="Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        />

            <input
  type="email"
  placeholder="Email Address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
          </section>

          <section className="checkout-section">
            <h2>Delivery Address</h2>

           <input
  type="text"
  placeholder="House / Flat / Building"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
/>

           <input
  type="text"
  placeholder="Street / Area"
  value={area}
  onChange={(e) => setArea(e.target.value)}
/>

            <div className="checkout-row">
              <input
  type="text"
  placeholder="City"
  value={city}
  onChange={(e) => setCity(e.target.value)}
/>

            <input
  type="text"
  placeholder="Pincode"
  value={pincode}
  onChange={(e) => setPincode(e.target.value)}
/>
            </div>

           <input
  type="text"
  placeholder="State"
  value={state}
  onChange={(e) => setState(e.target.value)}
/>
          </section>

          <section className="checkout-section">
            <h2>Payment</h2>

            <div className="payment-option">
           <input
  type="radio"
  name="payment"
  value="online"
  checked={paymentMethod === "online"}
  onChange={() => setPaymentMethod("online")}
/>

              <span>Online Payment</span>
            </div>

            <div className="payment-option">
            <input
  type="radio"
  name="payment"
  value="cod"
  checked={paymentMethod === "cod"}
  onChange={() => setPaymentMethod("cod")}
/>

              <span>Cash on Delivery</span>
            </div>
          </section>

        </div>

        <aside className="checkout-right">

          <h2>Order Summary</h2>

          <div className="checkout-items">

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => {
               const product = allProducts.find(
  (p) => p.name === item.name
);

                if (!product) return null;

                return (
                  <div
                    className="checkout-item"
                    key={`${item.name}-${item.colour || "Default"}-${item.size}-${index}`}
                  >
                   <img
  src={product.images?.[0] || product.image}
  alt={product.name}
/>

                    <div className="checkout-item-info">
                      <h3>{product.name}</h3>

                   <p>
  Colour: {item.colour || "Default"}
</p>

<p>
  Size: {item.size}
</p>

<p>
  Qty: {item.quantity}
</p>
                    </div>

      <strong>
  Rs {(
    (typeof product.price === "number"
      ? product.price
      : Number(
          product.price
            .replace("₹", "")
            .replace(/,/g, "")
        )) * item.quantity
  ).toLocaleString("en-IN")}
</strong>       </div>
                );
              })
            )}

          </div>

          <div className="checkout-total">
            <span>Total</span>

            <strong>
  Rs {total.toLocaleString("en-IN")}
</strong>
          </div>

         <button
  className="place-order-btn"
  onClick={handlePlaceOrder}
>
  PLACE ORDER
</button>

          <p className="checkout-note">
            Your order details will be securely processed.
          </p>

        </aside>

      </div>

    </main>
  );
}