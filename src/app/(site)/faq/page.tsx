import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { FAQ_ITEMS } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Quick answers about booking, hours, and check-in."
      />

      <div className="mt-10 space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-blue-100 bg-white p-6"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold text-brand-navy marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-brand-blue transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
