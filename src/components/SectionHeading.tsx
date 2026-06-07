import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  descriptionClassName?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-3 max-w-2xl text-base text-slate-600",
            align === "center" && "mx-auto",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
