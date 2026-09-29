"use client";

import { useEffect, useState } from "react";
import { products } from "./lib/products";
import { supabase } from "./lib/supabase";
const categories = [
  {
    name: "Farshi Suits",
    description: "Royal & graceful silhouettes",
    image: "/categories/farshi.jpg",
  },
  {
    name: "Cord Sets",
    description: "Effortless everyday elegance",
    image: "/categories/cord.jpg",
  },
  {
    name: "Suits",
    description: "Timeless ethnic collections",
    image: "/categories/suits.jpg",
  },
  {
    name: "Anarkali",
    description: "Elegant festive styles",
    image: "/categories/anarkali.jpg",
  },
  {
    name: "Pakistani Suits",
    description: "Classic designer aesthetics",
    image: "/categories/pakistani.jpg",
  },
  {
    name: "Sharara Sets",
    description: "Perfect for celebrations",
    image: "/categories/sharara.jpg",
  },
];

type Product = {
  name: string;
  category: string;
  price: string;
  image?: string;
  images?: string[];
  description: string;
  colours?: string[];
  sizes?:
  | Record<string, number>
  | Record<string, Record<string, number>>;
};

export default function Home() {
const [email, setEmail] = useState("");
const [subscribed, setSubscribed] = useState(false);
type CartItem = {
  name: string;
  colour?: string;
  size: string;
  quantity: number;
};

const [cart, setCart] = useState<CartItem[]>([]);
const [allProducts, setAllProducts] =
  useState<Product[]>([]);

useEffect(() => {
  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error loading products:", error);
      setAllProducts(products);
      return;
    }

    if (data && data.length > 0) {
      setAllProducts(data);
    } else {
      setAllProducts(products);
    }
  };

  loadProducts();
}, []);
const [currentUser, setCurrentUser] = useState<{
  name: string;
  email: string;
  mobile: string;
} | null>(null);
const [cartOpen, setCartOpen] = useState(false);
useEffect(() => {
  const shouldOpenCart = localStorage.getItem("open-cart");

  if (shouldOpenCart === "true") {
    setCartOpen(true);
    localStorage.removeItem("open-cart");
  }
}, []);
useEffect(() => {
  const savedUser = localStorage.getItem(
    "eleganza-current-user"
  );

  if (savedUser) {
    setCurrentUser(JSON.parse(savedUser));
  }
}, []);
const [cartLoaded, setCartLoaded] = useState(false);
 useEffect(() => {
  const savedCart = localStorage.getItem("eleganza-cart");

  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }

  setCartLoaded(true);
}, []);

useEffect(() => {
  if (!cartLoaded) return;

  localStorage.setItem(
    "eleganza-cart",
    JSON.stringify(cart)
  );
}, [cart, cartLoaded]);;
  const [wishlist, setWishlist] = useState<
  {
    name: string;
    colour: string;
    size: string;
  }[]
>([]);
  
  const [wishlistOpen, setWishlistOpen] = useState(false);
  useEffect(() => {
  const loadWishlist = async () => {
    const savedUser = localStorage.getItem(
      "eleganza-current-user"
    );

    if (!savedUser) {
      setWishlist([]);
      return;
    }

    const user = JSON.parse(savedUser);

    const { data, error } = await supabase
      .from("wishlists")
      .select("product_name, colour, size")
      .eq("user_email", user.email)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading wishlist:",
        error
      );
      setWishlist([]);
      return;
    }

    setWishlist(
      (data || []).map((item) => ({
        name: item.product_name,
        colour: item.colour,
        size: item.size,
      }))
    );
  };

  loadWishlist();
}, []);

  const [selectedSizes, setSelectedSizes] = useState<
  Record<string, string>
>({});
const [selectedColours, setSelectedColours] = useState<
  Record<string, string>
>({});
const [sizeStock, setSizeStock] = useState<
  Record<string, any>
>({});
useEffect(() => {
  const savedStock = localStorage.getItem("eleganza-stock");

  if (savedStock) {
    try {
      setSizeStock(JSON.parse(savedStock));
    } catch {
      setSizeStock({});
    }
  }
}, []);
const addToCart = (
  productName: string,
  size: string = "M",
  quantity: number = 1
) => {
  const product = allProducts.find(
    (item) => item.name === productName
  );

  const colour =
    selectedColours[productName] ||
    product?.colours?.[0] ||
    "Default";

  const availableStock = getAvailableStock(
    productName,
    colour,
    size
  );

  if (availableStock <= 0) {
    alert(
      `${productName} (${colour}, ${size}) is out of stock.`
    );
    return;
  }

  setCart((currentCart) => {
    const existingIndex = currentCart.findIndex(
      (item) =>
        item.name === productName &&
        item.size === size &&
        (item.colour || "Default") === colour
    );

    if (existingIndex !== -1) {
      if (
        currentCart[existingIndex].quantity + quantity >
        availableStock
      ) {
        alert(
          `Only ${availableStock} item(s) available for ${colour}, size ${size}.`
        );
        return currentCart;
      }

      return currentCart.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              quantity: item.quantity + quantity,
            }
          : item
      );
    }

    return [
      ...currentCart,
      {
        name: productName,
        colour,
        size,
        quantity,
      },
    ];
  });
};
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
const getAvailableStock = (
  productName: string,
  colour: string,
  size: string
) => {
  const product = allProducts.find(
    (item) => item.name === productName
  );

  if (!product) return 0;

  const stock = product.sizes;

  if (!stock) return 0;

  const colourStock = stock[colour];

  if (
    colourStock &&
    typeof colourStock === "object"
  ) {
    return colourStock[size] ?? 0;
  }

  if (typeof stock[size] === "number") {
    return stock[size] as number;
  }

  return 0;
};
const getAvailableSizes = (product: Product): string[] => {
  const stock = product.sizes;

  if (!stock) return [];

  const firstValue = Object.values(stock)[0];

  if (
    firstValue &&
    typeof firstValue === "object"
  ) {
    return Array.from(
      new Set(
        Object.values(stock).flatMap(
          (colourStock) =>
            Object.keys(
              colourStock as Record<string, number>
            )
        )
      )
    );
  }

  return Object.keys(
    stock as Record<string, number>
  );
};
 
const toggleWishlist = async (
  productName: string,
  size: string
) => {
  const savedUser = localStorage.getItem(
    "eleganza-current-user"
  );

  if (!savedUser) {
    alert("Please login to use wishlist.");
    return;
  }

  const user = JSON.parse(savedUser);

  const product = allProducts.find(
    (item) => item.name === productName
  );

  if (!product) return;

  const colour =
    selectedColours[productName] ||
    product.colours?.[0] ||
    "Default";

  const exists = wishlist.some(
    (item) =>
      item.name === productName &&
      item.colour === colour &&
      item.size === size
  );

  if (exists) {
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_email", user.email)
      .eq("product_name", productName)
      .eq("colour", colour)
      .eq("size", size);

    if (error) {
      console.error(
        "Error removing wishlist item:",
        error
      );
      alert("Could not remove from wishlist.");
      return;
    }

    setWishlist((currentWishlist) =>
      currentWishlist.filter(
        (item) =>
          !(
            item.name === productName &&
            item.colour === colour &&
            item.size === size
          )
      )
    );

    return;
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({
      user_email: user.email,
      product_name: productName,
      colour,
      size,
    });

  if (error) {
    console.error(
      "Error adding wishlist item:",
      error
    );
    alert("Could not add to wishlist.");
    return;
  }

  setWishlist((currentWishlist) => [
    ...currentWishlist,
    {
      name: productName,
      colour,
      size,
    },
  ]);
};


  return (
    <main>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-container">
          <a href="/" className="brand">
            <img
              src="/logo.png"
              alt="Eleganza by Mittali"
              className="logo"
            />
          </a>

          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="#shop">Shop</a>
            <a href="#categories">Collections</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="nav-icons">
            <button
            aria-label="Search"
            className="search-button"
            onClick={() => setSearchOpen(!searchOpen)}
            >
            ⌕
            </button>
            <button
            aria-label="Wishlist"
            className="wishlist-nav-btn"
            onClick={() => setWishlistOpen(true)}
            >
  ♡
  {wishlist.length > 0 && (
    <span className="wishlist-count">
      {wishlist.length}
    </span>
  )}
</button>
            <button
            aria-label="Cart"
            className="cart-button"
          onClick={() => setCartOpen(true)}
            >
  🛍️
  {cart.length > 0 && (
    <span className="cart-count">{cart.length}</span>
  )}
</button>
{currentUser ? (
  <>
    <a href="/account" className="auth-nav-link">
      👤 {currentUser.name}
    </a>

    <button
      className="auth-nav-link auth-logout-btn"
      onClick={() => {
        localStorage.removeItem(
          "eleganza-current-user"
        );
        setCurrentUser(null);
      }}
    >
      LOGOUT
    </button>
  </>
) : (
  <>
    <a href="/login" className="auth-nav-link">
      LOGIN
    </a>

    <a href="/register" className="auth-nav-link">
      REGISTER
    </a>
  </>
)}
          </div>
        </div>
      </header>
      {searchOpen && (
  <div className="search-panel">
    <div className="search-inner">
      <input
        type="text"
        placeholder="Search for suits, cord sets, anarkalis..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
      />

      <button
        className="search-close"
        onClick={() => {
          setSearchOpen(false);
          setSearchTerm("");
        }}
      >
        ×
      </button>
    </div>
    {searchTerm.trim() !== "" && (
  <div className="search-results">
    {allProducts
      .filter((product) =>
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim())
      )
      .map((product) => (
        <div
  className="search-result-item"
  key={product.name}
  onClick={() => {
    setSearchOpen(false);
    setSearchTerm("");
    document
      .getElementById(`product-${product.name}`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }}
>
          <img
  src={product.images?.[0] || product.image}
  alt={product.name}
/>

          <div>
            <h3>{product.name}</h3>
            <p>{product.category}</p>
         <strong>
  Rs {Number(
    String(product.price).replace(/[₹,Rs\s]/gi, "")
  ).toLocaleString("en-IN")}
</strong>
          </div>
        </div>
      ))}

    {allProducts.filter((product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim())
    ).length === 0 && (
      <p className="no-search-results">
        No allProducts found.
      </p>
    )}
  </div>
)}
  </div>
)}

      {cartOpen && (
  <>
    <div
      className="cart-overlay"
      onClick={() => setCartOpen(false)}
    ></div>

    <aside className="cart-drawer">
      <div className="cart-header">
        <h2>Your Cart</h2>

        <button
          className="cart-close"
          onClick={() => setCartOpen(false)}
        >
          ×
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <button
            className="continue-shopping"
            onClick={() => setCartOpen(false)}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
<div className="cart-items">
  {cart.map((item, index) => {
    const product = allProducts.find(
      (p) => p.name === item.name
    );

    if (!product) return null;

    return (
      <div
        className="cart-item"
        key={`${item.name}-${item.size}-${index}`}
      >
       <img
  src={product.images?.[0] || product.image}
  alt={product.name}
/>

        <div className="cart-item-info">
          <h3>{product.name}</h3>

          <p>
  Rs {Number(
    String(product.price).replace(/[₹,Rs\s]/gi, "")
  ).toLocaleString("en-IN")}
</p>

          <p>
            Size: <strong>{item.size}</strong>
          </p>
          <p>
  Colour:{" "}
  <strong>
    {item.colour || "Default"}
  </strong>
</p>

          <div className="quantity-control">
  <button
    onClick={() => {
      setCart((currentCart) =>
        currentCart.map((cartItem, i) => {
          if (i !== index) return cartItem;

          return {
            ...cartItem,
            quantity: Math.max(1, cartItem.quantity - 1),
          };
        })
      );
    }}
  >
    −
  </button>

  <span>{item.quantity}</span>

  <button
    onClick={() => {
const availableStock =
  getAvailableStock(
    item.name,
    item.colour || "Default",
    item.size
  );

      if (item.quantity >= availableStock) {
        alert(
          `${item.name} - Size ${item.size} has only ${availableStock} item(s) in stock.`
        );
        return;
      }

      setCart((currentCart) =>
        currentCart.map((cartItem, i) => {
          if (i !== index) return cartItem;

const availableStock =
  getAvailableStock(
    cartItem.name,
    cartItem.colour ||
      "Default",
    cartItem.size
  );
if (cartItem.quantity >= availableStock) {
  return cartItem;
}

return {
  ...cartItem,
  quantity: cartItem.quantity + 1,
};
        })
      );
    }}
  >
    +
  </button>
</div>

          <button
            className="remove-cart"
            onClick={() =>
              setCart((currentCart) =>
                currentCart.filter((_, i) => i !== index)
              )
            }
          >
            REMOVE
          </button>
        </div>
      </div>
    );
  })}
</div>

          <div className="cart-total">
  <span>TOTAL</span>

  <strong>
    ₹
    {cart
      .reduce((total, item) => {
        const product = allProducts.find(
          (p) => p.name === item.name
        );

        if (!product) return total;

       const price =
  typeof product.price === "number"
    ? product.price
    : Number(
        product.price
          .replace("₹", "")
          .replace(/,/g, "")
      );

        return total + price * item.quantity;
      }, 0)
      .toLocaleString("en-IN")}
  </strong>
</div>

          <button
  className="checkout-btn"
  onClick={() => {
    const currentUser = localStorage.getItem(
      "eleganza-current-user"
    );

    if (currentUser) {
      window.location.href = "/checkout";
    } else {
      localStorage.setItem(
        "eleganza-checkout-redirect",
        "true"
      );

      window.location.href = "/login";
    }
  }}
>
  CHECKOUT
</button>
        </>
      )}
    </aside>
  </>
)}
{wishlistOpen && (
  <>
    <div
      className="wishlist-overlay"
      onClick={() => setWishlistOpen(false)}
    ></div>

    <aside className="wishlist-drawer">
      <div className="wishlist-header">
        <h2>My Wishlist</h2>

        <button
          className="wishlist-close"
          onClick={() => setWishlistOpen(false)}
        >
          ×
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlist.map((item) => {
            const product = allProducts.find(
              (p) => p.name === item.name
            );

            if (!product) return null;

            return (
              <div
  className="wishlist-item"
  key={`${item.name}-${item.colour}-${item.size}`}
 onClick={() =>
  (window.location.href = `/product/${item.name
    .toLowerCase()
    .replaceAll(" ", "-")}?size=${item.size}&colour=${encodeURIComponent(
    item.colour || "Default"
  )}`)
}
><img
  src={product.images?.[0] || product.image}
  alt={product.name}
/>

                <div className="wishlist-item-info">
                  <h3>{product.name}</h3>
                 <p>
  Rs {Number(
    String(product.price).replace(/[₹,Rs\s]/gi, "")
  ).toLocaleString("en-IN")}
</p>
                  <p className="wishlist-item-size">
  Size: {item.size}
</p>
<p className="wishlist-item-colour">
  Colour: {item.colour || "Default"}
</p>

             <button
  className="wishlist-remove"
  onClick={(e) => {
    e.stopPropagation();
    toggleWishlist(item.name, item.size);
  }}
>
  REMOVE
</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  </>
)}

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">ELEGANZA BY MITTALI</p>

          <h1>
            Elegance
            <br />
            in Every Thread
          </h1>

          <p className="hero-text">
            Discover timeless Indian fashion, thoughtfully curated
            for the modern woman.
          </p>

          <a href="#shop" className="primary-btn">
            SHOP COLLECTION
          </a>
        </div>

        <div className="hero-decoration">
          <div className="hero-circle"></div>
          <div className="hero-line"></div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section" id="categories">
        <div className="section-heading">
          <p className="small-heading">DISCOVER YOUR STYLE</p>
          <h2>Shop by Category</h2>
          <p>
            Explore our carefully curated collections designed
            to make every occasion special.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <a
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className="category-card"
              key={category.name}
            >
            <div className="category-image">
  <img
    src={category.image}
    alt={category.name}
  />
</div>

              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <span className="explore">
                  Explore Collection →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="allProducts-section" id="shop">
        <div className="section-heading">
          <p className="small-heading">JUST IN</p>
          <h2>New Arrivals</h2>
          <p>
            Fresh styles, beautiful fabrics and timeless details.
          </p>
        </div>

        <div className="product-grid">
          {allProducts
  .filter((product) => {
    const search = searchTerm
      .toLowerCase()
      .trim()
      .replace(/s$/, "");

    const text = `${product.name} ${product.category}`
      .toLowerCase();

    return text.includes(search);
  })
  .map((product, index) => (
  <div
  className="product-card"
  key={product.name}
  id={`product-${product.name}`}
>
             <div
  className={`product-image product-${index + 1}`}
  onClick={() =>
    window.location.href = `/product/${product.name
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }
>
  <img
    src={product.images?.[0] || product.image}
    alt={product.name}
  />
  <span>NEW</span>
</div>
              <div className="product-info">
                <p>{product.category}</p>
               <h3
  onClick={() =>
    window.location.href = `/product/${product.name
      .toLowerCase()
      .replaceAll(" ", "-")}`
  }
  style={{ cursor: "pointer" }}
>
  {product.name}
</h3>
<div className="product-options">

  {/* COLOUR */}
  <div className="product-colours">
    <span>COLOUR</span>

    <div className="colour-buttons">
      {(product.colours?.length
        ? product.colours
        : ["Default"]
      ).map((colour) => (
        <button
          key={colour}
          type="button"
          className={
            (selectedColours[product.name] ||
              product.colours?.[0] ||
              "Default") === colour
              ? "selected"
              : ""
          }
          onClick={() =>
            setSelectedColours((current) => ({
              ...current,
              [product.name]: colour,
            }))
          }
        >
          {colour}
        </button>
      ))}
    </div>
  </div>

  {/* SIZE */}
  <div className="product-sizes">
    <span>SIZE</span>

    <div className="size-buttons">
{getAvailableSizes(product).map((size) => {
  const selectedColour =
    selectedColours[product.name] ||
    product.colours?.[0] ||
    "Default";

  const availableStock = getAvailableStock(
    product.name,
    selectedColour,
    size
  );

  return (
    <button
      key={size}
      type="button"
      disabled={availableStock === 0}
      className={
        selectedSizes[product.name] === size
          ? "selected"
          : ""
      }
      onClick={() =>
        setSelectedSizes((current) => ({
          ...current,
          [product.name]: size,
        }))
      }
    >
      {size}
    </button>
  );
})}
    </div>

    {selectedSizes[product.name] && (
      <p className="size-stock-text">
        {getAvailableStock(
          product.name,
          selectedColours[product.name] ||
            product.colours?.[0] ||
            "Default",
          selectedSizes[product.name]
        )}{" "}
        pieces available
      </p>
    )}
  </div>

</div>
             <div className="product-bottom">
<strong>
  Rs {Number(
    String(product.price).replace(/[₹,Rs\s]/gi, "")
  ).toLocaleString("en-IN")}
</strong>
<button
  className="add-cart-btn"
  onClick={() =>
   addToCart(
  product.name,
  selectedSizes[product.name] ||
    getAvailableSizes(product)[0]
)
  }
>
  ADD TO CART
</button>

  <button
  className={`wishlist-btn ${
wishlist.some(
  (item) =>
    item.name === product.name &&
    item.colour ===
      (selectedColours[product.name] ||
        product.colours?.[0] ||
        "Default") &&
    item.size ===
      (selectedSizes[product.name] || "M")
)
  ? "active"
  : ""
  }`}
  aria-label={`Add ${product.name} to wishlist`}
 onClick={() =>
  toggleWishlist(
    product.name,
    selectedSizes[product.name] || "M"
  )
}
>
  {
  wishlist.some(
    (item) =>
      item.name === product.name &&
      item.size === (selectedSizes[product.name] || "M")
  )
    ? "♥"
    : "♡"
}
</button>
</div>
              </div>
            </div>
          ))}
        </div>

        <div className="center-button">
          <a href="/shop" className="outline-btn">
            VIEW ALL allProducts
          </a>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-content">
          <p className="small-heading">OUR STORY</p>

          <h2>
            Where Tradition
            <br />
            Meets Elegance
          </h2>

          <p>
            Eleganza by Mittali brings together the beauty of
            traditional Indian craftsmanship with contemporary
            fashion. Every piece is selected with attention to
            fabric, detail and timeless style.
          </p>

          <a href="#contact" className="primary-btn">
            KNOW OUR STORY
          </a>
        </div>

        <div className="about-art">
          <div>
            E
            <br />
            B
            <br />
            M
          </div>
        </div>
      </section>

      {/* WHY ELEGANZA */}
      <section className="why-section">
        <div className="section-heading">
          <p className="small-heading">THE ELEGANZA PROMISE</p>
          <h2>Made for Every Occasion</h2>
        </div>

        <div className="features">
          <div className="feature">
            <span>✦</span>
            <h3>Curated Fashion</h3>
            <p>
              Handpicked styles that blend tradition and modern
              elegance.
            </p>
          </div>

          <div className="feature">
            <span>✦</span>
            <h3>Quality Fabrics</h3>
            <p>
              Beautiful fabrics selected for comfort and lasting
              style.
            </p>
          </div>

          <div className="feature">
            <span>✦</span>
            <h3>Personal Service</h3>
            <p>
              We are always here to help you find your perfect
              outfit.
            </p>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <p className="small-heading">STAY CONNECTED</p>
        <h2>Be the first to discover what's new.</h2>

      <div className="newsletter-form">
  <input
    type="email"
    placeholder="Enter your email address"
    value={email}
    onChange={(e) => {
      setEmail(e.target.value);
      setSubscribed(false);
    }}
  />

  <button
    onClick={() => {
      if (!email.trim()) {
        alert("Please enter your email address.");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        alert("Please enter a valid email address.");
        return;
      }

      setSubscribed(true);
      setEmail("");
    }}
  >
    SUBSCRIBE
  </button>

  {subscribed && (
    <p style={{ marginTop: "10px" }}>
      Thank you for subscribing! ❤️
    </p>
  )}
</div>
      </section>

      {/* FOOTER */}
      <footer id="contact">
        <div className="footer-main">
          <div>
            <img
              src="/logo.png"
              alt="Eleganza by Mittali"
              className="footer-logo"
            />

            <p>
              Elegant fashion inspired by tradition,
              designed for today.
            </p>
          </div>

          <div>
            <h4>SHOP</h4>
            <a href="#categories">Farshi Suits</a>
            <a href="#categories">Cord Sets</a>
            <a href="#categories">Suits</a>
            <a href="#categories">Anarkali</a>
          </div>

          <div>
            <h4>QUICK LINKS</h4>
            <a href="/">Home</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
            <a href="/shop">Shop</a>
          </div>
    <div>
      <h4>POLICIES</h4>
      <a href="/exchange-return">Exchange & Return</a>
      <a href="/shipping">Shipping & Delivery</a>
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/terms-conditions">Terms & Conditions</a>
      <a href="/cancellation-refund">
  Cancellation & Refund
</a>
    </div>
          <div>
            <h4>CONTACT</h4>

            <a
              href="https://wa.me/917888535887"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>

            <a
              href="https://www.instagram.com/eleganza_by_mittali"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Eleganza by Mittali. All Rights Reserved.</p>
          <p>Made with elegance ♡</p>
        </div>
      </footer>
    </main>
  );
}