import { Star } from "lucide-react";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { FEATURED_REVIEWS, GOOGLE_REVIEWS_URL } from "@/lib/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Google Reviews"
        title="What our customers say"
        description="Real reviews from Richmond drivers who wash with Buzz Thru."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURED_REVIEWS.map((review) => (
          <Card key={review.name}>
            <StarRating rating={review.rating} />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              &ldquo;{review.text}&rdquo;
            </p>
            <div className="mt-4 border-t border-blue-100 pt-4">
              <p className="font-semibold text-brand-navy">{review.name}</p>
              <p className="mt-1 text-xs text-slate-500">{review.date}</p>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-brand-navy transition-opacity hover:opacity-80"
        >
          Read more reviews on Google
        </a>
      </p>
    </section>
  );
}
