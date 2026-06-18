import Image from "next/image";

export function PhospheneShowcase() {
  return (
    <div className="group/phosphene relative h-full overflow-hidden bg-[oklch(0.12_0.006_260)]">
      <Image
        src="/work/phosphene/hero-section.jpeg"
        alt="Phosphene template-first landing page"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="object-cover object-top opacity-90 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/phosphene:scale-[1.025] group-hover/phosphene:opacity-0"
        priority
      />
      <Image
        src="/work/phosphene/template-builder.png"
        alt="Phosphene template review workflow"
        fill
        sizes="(min-width: 1024px) 620px, 100vw"
        className="object-cover object-top opacity-0 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/phosphene:scale-[1.025] group-hover/phosphene:opacity-90"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,oklch(0.12_0.006_260/.82)_100%)]"
      />
    </div>
  );
}
