import Image from "next/image";

export function PhospheneShowcase() {
  return (
    <div className="relative h-full overflow-hidden bg-[oklch(0.12_0.006_260)]">
      <Image
        src="/work/phosphene/hero-section.jpeg"
        alt="Phosphene template-first landing page"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="object-cover object-top opacity-90"
        priority
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,oklch(0.12_0.006_260/.82)_100%)]"
      />
    </div>
  );
}
