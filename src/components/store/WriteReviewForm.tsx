import React, { useState } from "react";
import { ArrowLeft, Star, CheckCircle2, Package } from "lucide-react";
import { submitProductReview, type Reviewer } from "./data";

export interface ReviewTarget {
  productId: string;
  title: string;
  image?: string | undefined;
}

interface WriteReviewFormProps {
  target: ReviewTarget;
  reviewer: Reviewer;
  onBack: () => void;
  /** Called once the review has been saved. */
  onSubmitted: (productId: string) => void;
}

/**
 * "Write a review" screen, opened from My Orders for a product the shopper has
 * ordered. The review is posted under the name they registered with (there is
 * no name field), saved as Pending, and only shown on the product once staff
 * approve it. The server re-checks that the shopper actually ordered it.
 */
export function WriteReviewForm({ target, reviewer, onBack, onSubmitted }: WriteReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (rating < 1) return setError("Please choose a star rating.");
    if (comment.trim().length < 5) return setError("Please write a few words about the product.");

    setSubmitting(true);
    setError("");
    try {
      await submitProductReview(target.productId, reviewer, { rating, comment: comment.trim() });
      setDone(true);
      onSubmitted(target.productId);
    } catch (err: any) {
      setError(err?.message || "Could not submit your review. Please try again.");
      // Server says they can't review it (already reviewed / not purchased): sync the list.
      if (err?.code === "ALREADY_REVIEWED" || err?.code === "NOT_PURCHASED")
        onSubmitted(target.productId);
    } finally {
      setSubmitting(false);
    }
  };

  const shownRating = hoverRating || rating;

  return (
    <div className="flex flex-col max-h-[80vh]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06] dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to orders"
          className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-secondary active:scale-90 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h3 className="font-display font-black text-sm text-foreground">Write a Review</h3>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary overflow-hidden">
            {target.image ? (
              <img src={target.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <Package className="h-4 w-4 text-neutral-400" />
            )}
          </div>
          <p className="min-w-0 flex-1 text-xs font-semibold text-foreground line-clamp-2">
            {target.title}
          </p>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-black text-foreground">Thanks for your review!</p>
            <p className="text-[11px] text-neutral-500">
              It will appear on the product once our team approves it.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-[40px] items-center rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] px-5 text-xs font-black text-slate-950 cursor-pointer"
            >
              Back to My Orders
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-center">
              <p className="text-xs font-bold text-foreground">How would you rate it?</p>
              <div className="flex justify-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    aria-pressed={rating === s}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`h-8 w-8 ${s <= shownRating ? "fill-amber-400 text-amber-400" : "text-stone-300 dark:text-stone-600"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
                Your review
              </span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="What did you like or dislike? How was the quality?"
                className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-foreground leading-relaxed outline-none focus:border-[#B0CB1F] focus:ring-1 focus:ring-[#B0CB1F]"
              />
            </label>

            <p className="text-[10.5px] text-neutral-500">
              Posting as <strong className="text-foreground">{reviewer.name}</strong>
            </p>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[46px] rounded-xl bg-[#B0CB1F] hover:bg-[#9cb519] active:bg-[#889e14] text-slate-950 font-black text-xs tracking-wide cursor-pointer active:scale-95 transition-all disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
