import type { Metadata } from "next";
import { Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { BUSINESS } from "@/lib/constants";
import { SELF_SERVE_INFO } from "@/lib/self-serve";

export const metadata: Metadata = {
  title: "Self-Serve",
  description:
    "Self-serve car wash bays at Buzz Thru. No appointment needed. Wash your own car on your schedule.",
};

export default function SelfServePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Self-Serve"
        title={SELF_SERVE_INFO.title}
        description={SELF_SERVE_INFO.subtitle}
      />

      <Card className="mt-10 border-brand-blue/20 bg-brand-sky/40">
        <p className="text-sm font-semibold text-brand-navy">Info only</p>
        <p className="mt-2 text-sm text-slate-600">
          Self-serve bays do not use our online booking system. Just visit a location,
          pay at the bay, and start washing.
        </p>
      </Card>

      <section className="mt-12">
        <SectionHeading title="How it works" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SELF_SERVE_INFO.steps.map((step, index) => (
            <Card key={step.title}>
              <p className="text-sm font-semibold text-brand-blue">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-brand-navy">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Good to know" />
        <Card className="mt-8">
          <ul className="space-y-4">
            {SELF_SERVE_INFO.notes.map((note) => (
              <li key={note} className="flex items-start gap-3 text-sm text-slate-600">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <span>{note}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
              <span>Hours and bay availability may vary by location.</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
              <span>Questions? Call {BUSINESS.phone} or email {BUSINESS.email}.</span>
            </li>
          </ul>
        </Card>
      </section>

      <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Button href="/locations">Find a Location</Button>
        <Button href="/book" variant="secondary">
          Book Attendant Hand Wash
        </Button>
      </div>
    </div>
  );
}
