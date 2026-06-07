import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { BUSINESS } from "@/lib/constants";
import { FAQ_ITEMS } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact & FAQ",
  description:
    "Contact Buzz Thru Car Wash or find answers about booking, hours, and check-in.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact & FAQ"
        description="Reach out with questions or browse common answers below."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {[
            {
              icon: Phone,
              label: "Phone",
              value: BUSINESS.phone,
              href: `tel:${BUSINESS.phone.replace(/\D/g, "")}`,
            },
            {
              icon: Mail,
              label: "Email",
              value: BUSINESS.email,
              href: `mailto:${BUSINESS.email}`,
            },
            {
              icon: MapPin,
              label: "Locations",
              value: "Three Richmond locations. See our Locations page.",
              href: "/locations",
            },
          ].map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-2xl border border-blue-100 p-5"
            >
              <Icon className="mt-1 h-5 w-5 shrink-0 text-brand-blue" />
              <div>
                <p className="font-semibold text-brand-navy">{label}</p>
                <a
                  href={href}
                  className="mt-1 block text-sm text-slate-600 transition-opacity hover:text-brand-navy hover:opacity-80"
                >
                  {value}
                </a>
              </div>
            </div>
          ))}
        </div>

        <form className="rounded-2xl border border-blue-100 bg-brand-light p-6">
          <h3 className="text-lg font-semibold text-brand-navy">Send a Message</h3>
          <p className="mt-2 text-sm text-slate-600">
            Form submission coming soon. Email us at{" "}
            <a
              href={`mailto:${BUSINESS.email}`}
              className="font-semibold text-brand-navy hover:opacity-80"
            >
              {BUSINESS.email}
            </a>{" "}
            for now.
          </p>
          <div className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Your name"
              disabled
              className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm disabled:opacity-60"
            />
            <input
              type="email"
              placeholder="Email address"
              disabled
              className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm disabled:opacity-60"
            />
            <textarea
              placeholder="How can we help?"
              rows={4}
              disabled
              className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm disabled:opacity-60"
            />
            <button
              type="button"
              disabled
              className="w-full rounded-lg bg-brand-navy px-4 py-3 text-sm font-semibold text-white opacity-60"
            >
              Send Message (Coming Soon)
            </button>
          </div>
        </form>
      </div>

      <section id="faq" className="mt-16 scroll-mt-24">
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
      </section>
    </div>
  );
}
