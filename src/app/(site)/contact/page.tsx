import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Questions about your booking? Reach out anytime."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {[
            { icon: Phone, label: "Phone", value: BUSINESS.phone },
            { icon: Mail, label: "Email", value: BUSINESS.email },
            {
              icon: MapPin,
              label: "Locations",
              value: "Two Richmond locations. See Locations page.",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-2xl border border-blue-100 p-5"
            >
              <Icon className="mt-1 h-5 w-5 text-brand-blue" />
              <div>
                <p className="font-semibold text-brand-navy">{label}</p>
                <p className="mt-1 text-sm text-slate-600">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="rounded-2xl border border-blue-100 bg-brand-light p-6">
          <h3 className="text-lg font-semibold text-brand-navy">
            Send a Message
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Form submission coming soon. UI placeholder for now.
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
    </div>
  );
}
