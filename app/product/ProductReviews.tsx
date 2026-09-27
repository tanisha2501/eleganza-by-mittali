"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Review = {
  id: number;
  customer_name: string | null;
  rating: number;
  review: string | null;
  created_at: string;
};

export default function ProductReviews({
  productName,
}: {
  productName: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("id, customer_name, rating, review, created_at")
      .eq("product_name", productName)
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading reviews:", error);
      return;
    }

    setReviews(data || []);
  };

  useEffect(() => {
    loadReviews();
  }, [productName]);

  const submitReview = async () => {
    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user?.email) {
      alert("Please login to submit a review.");
      setLoading(false);
      return;
    }

    const customerName =
      user.user_metadata?.name ||
      user.email.split("@")[0];

    const { error } = await supabase
      .from("product_reviews")
      .insert({
        product_name: productName,
        customer_email: user.email,
        customer_name: customerName,
        rating,
        review: reviewText.trim(),
        approved: false,
      });

    if (error) {
      console.error("Review submission error:", error);
      alert("Unable to submit review. Please try again.");
      setLoading(false);
      return;
    }

    setReviewText("");
    setRating(5);
    setLoading(false);

    alert("Thank you! Your review has been submitted for approval.");
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + item.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <section className="product-reviews">
      <div className="product-reviews-header">
        <h2>Customer Reviews</h2>

        {reviews.length > 0 && (
          <p>
            ⭐ {averageRating} / 5 · {reviews.length} review
            {reviews.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="review-form">
        <h3>Write a Review</h3>

        <div className="review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} stars`}
              className={star <= rating ? "active" : ""}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
        />

        <button
          type="button"
          onClick={submitReview}
          disabled={loading}
          className="submit-review-btn"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">
            No reviews yet. Be the first to review this product! ❤️
          </p>
        ) : (
          reviews.map((item) => (
            <div className="review-card" key={item.id}>
              <div className="review-card-top">
                <strong>
                  {item.customer_name || "Customer"}
                </strong>

                <span>
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </span>
              </div>

              {item.review && <p>{item.review}</p>}

              <small>
                {new Date(item.created_at).toLocaleDateString("en-IN")}
              </small>
            </div>
          ))
        )}
      </div>
    </section>
  );
}