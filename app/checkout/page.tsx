"use client";

import { useEffect, useState } from "react";
import { products as defaultProducts } from "../lib/products";

type CartItem = {
  name: string;
  colour?: string;
  size: string;
  quantity: number;
};


export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allProducts, setAllProducts] =
  useState(defaultProducts);
  const [customerName, setCustomerName] = useState("");
const [mobile, setMobile] = useState("");
const [email, setEmail] = useState("");
const [address, setAddress] = useState("");
const [area, setArea] = useState("");
const [city, setCity] = useState("");
const [pincode, setPincode] = useState("");
const [state, setState] = useState("");

 useEffect(() => {
  const savedCart = localStorage.getItem("eleganza-cart");

  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }

  const savedProducts = localStorage.getItem(
    "eleganza-products"
  );

  if (savedProducts) {
    const savedData = JSON.parse(savedProducts);

    setAllProducts([
      ...defaultProducts,
      ...savedData,
    ]);
  }
}, []);

const total = cart.reduce((sum, item) => {
 const product = allProducts.find(
  (p) => p.name === item.name
);

  if (!product) return sum;

  const price = Number(
    product.price
      .replace("₹", "")
      .replace(",", "")
  );

  return sum + price * item.quantity;
}, 0);

 const handlePlaceOrder = () => {
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
  const savedStock = localStorage.getItem("eleganza-stock");

const stockData = savedStock
  ? JSON.parse(savedStock)
  : {
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
    };

for (const item of cart) {
  const productStock =
    stockData[item.name];

  let availableStock = 0;

  if (
    productStock &&
    productStock[
      item.colour || "Default"
    ] &&
    typeof productStock[
      item.colour || "Default"
    ] === "object"
  ) {
    availableStock =
      productStock[
        item.colour || "Default"
      ][item.size] ?? 0;
  } else {
    availableStock =
      productStock?.[item.size] ?? 0;
  }

  if (
    item.quantity >
    availableStock
  ) {
    alert(
      `${item.name} (${item.colour || "Default"}, ${item.size}) has only ${availableStock} item(s) left in stock.`
    );
    return;
  }
}
  const orderNumber =
    "ELG-" +
    Math.floor(100000 + Math.random() * 900000);

  const newOrder = {
    orderNumber: orderNumber,

    customer: {
      name: customerName,
      mobile: mobile,
      email: email,
      address: address,
      area: area,
      city: city,
      pincode: pincode,
      state: state,
    },

    items: cart,

    total: total,

    date: new Date().toLocaleString("en-IN"),

    status: "Pending",
  };

  const savedOrders =
    localStorage.getItem("eleganza-orders");

  const currentOrders = savedOrders
    ? JSON.parse(savedOrders)
    : [];

  currentOrders.push(newOrder);

  localStorage.setItem(
    "eleganza-orders",
    JSON.stringify(currentOrders)
  );
  localStorage.setItem(
  "eleganza-last-order",
  orderNumber
);

cart.forEach((item) => {
  const productStock =
    stockData[item.name];

  if (!productStock) return;

  const selectedColour =
    item.colour || "Default";

  if (
    productStock[selectedColour] &&
    typeof productStock[
      selectedColour
    ] === "object"
  ) {
    productStock[
      selectedColour
    ][item.size] = Math.max(
      0,
      productStock[
        selectedColour
      ][item.size] -
        item.quantity
    );
  } else if (
    productStock[item.size] !==
    undefined
  ) {
    /*
     * Old size-only products
     */
    productStock[item.size] =
      Math.max(
        0,
        productStock[item.size] -
          item.quantity
      );
  }
});
localStorage.setItem(
  "eleganza-stock",
  JSON.stringify(stockData)
);

localStorage.removeItem("eleganza-cart");

window.location.href = "/order-success";
  
};

  return (
    <main className="checkout-page">

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
                defaultChecked
              />

              <span>Online Payment</span>
            </div>

            <div className="payment-option">
              <input
                type="radio"
                name="payment"
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
                      ₹
                      {(
                        Number(
                          product.price
                            .replace("₹", "")
                            .replace(",", "")
                        ) * item.quantity
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                );
              })
            )}

          </div>

          <div className="checkout-total">
            <span>Total</span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
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