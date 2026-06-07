import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Our Story"
        title="About Buzz Thru"
        description="Placeholder content. Daniel will provide the final about copy."
      />

      <div className="prose prose-slate mt-10 max-w-3xl">
        <p className="text-lg leading-8 text-slate-600">
          Buzz Thru Car Wash was built on a simple idea: make getting your car
          clean fast, friendly, and hassle-free. With three Richmond-area locations
          and online booking, we help busy drivers stay on schedule without
          sacrificing a spotless shine.
        </p>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          From quick express washes to premium detailing packages, our team
          treats every vehicle like their own. Book online, pull up at your
          scheduled time, and buzz on with your day.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { label: "Locations", value: "2" },
          { label: "Happy Washes", value: "10,000+" },
          { label: "Avg. Visit", value: "30 min" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-brand-sky p-6 text-center"
          >
            <p className="text-3xl font-bold text-brand-navy">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Button href="/book">Book Your Wash</Button>
      </div>
    </div>
  );
}
