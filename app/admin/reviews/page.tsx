"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Review = {
  id: number;
  product_name: string;
  customer_email: string;
  customer_name: string | null;
  rating: number;
  review: string | null;
  approved: boolean;
  created_at: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      window.location.href = "/admin/login";
      return;
    }

    if (user.email !== "mittaligoyal2602@gmail.com") {
      await supabase.auth.signOut();
      window.location.href = "/admin/login";
      return;
    }

    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading reviews:", error);
      setLoading(false);
      return;
    }

    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const updateApproval = async (
    id: number,
    approved: boolean
  ) => {
    const { error } = await supabase
      .from("product_reviews")
      .update({ approved })
      .eq("id", id);

    if (error) {
      console.error("Review update error:", error);
      alert("Unable to update review.");
      return;
    }

    setReviews((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, approved }
          : item
      )
    );
  };

  const deleteReview = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Review delete error:", error);
      alert("Unable to delete review.");
      return;
    }

    setReviews((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <p>Loading reviews...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <div>
            <p className="admin-small-heading">
              ELEGANZA BY MITTALI
            </p>

            <h1>Customer Reviews</h1>

            <p>
              Review and manage customer feedback before
              publishing it on the website.
            </p>
          </div>

          <nav className="admin-nav">
          <a href="/admin/dashboard">
            Dashboard
          </a>

          <a href="/admin/orders">
            Orders
          </a>

          <a href="/admin/products/add">
            Add Product
          </a>

          <a href="/admin/reviews">
            Reviews
          </a>
        </nav>

          <span className="orders-count">
            {reviews.length} Reviews
          </span>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/admin/login";
            }}
          >
            LOGOUT
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="admin-empty">
            <h2>No reviews yet</h2>
            <p>
              Customer reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-reviews-list">

            {reviews.map((item) => (
              <div
                className="admin-review-card"
                key={item.id}
              >

                <div className="admin-review-top">

                  <div>
                    <p className="admin-review-product">
                      {item.product_name}
                    </p>

                    <h3>
                      {item.customer_name || "Customer"}
                    </h3>

                    <p className="admin-review-email">
                      {item.customer_email}
                    </p>
                  </div>

                  <div className="admin-review-rating">
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </div>

                </div>

                <p className="admin-review-text">
                  {item.review || "No written review."}
                </p>

                <p className="admin-review-date">
                  {new Date(
                    item.created_at
                  ).toLocaleDateString("en-IN")}
                </p>

                <div className="admin-review-actions">

                  {item.approved ? (
                    <button
                      type="button"
                      className="review-unapprove-btn"
                      onClick={() =>
                        updateApproval(item.id, false)
                      }
                    >
                      Unapprove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="review-approve-btn"
                      onClick={() =>
                        updateApproval(item.id, true)
                      }
                    >
                      Approve Review
                    </button>
                  )}

                  <button
                    type="button"
                    className="review-delete-btn"
                    onClick={() =>
                      deleteReview(item.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}