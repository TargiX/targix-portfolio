import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AnchorDemo } from "@/components/anchor-demo";
import { AnchorScrollytell, AnchorParallaxGallery } from "@/components/anchor-screens";
import { YouTubeEmbed } from "@/components/youtube-embed";
import { BrokerVideos } from "@/components/broker-videos";
import { PhospheneScreen } from "@/components/phosphene-screens";
import { RoomboardScreen } from "@/components/roomboard-screens";
import { RoomboardThemeShowcase } from "@/components/roomboard-theme-showcase";
import { PromptCompilerArtifact } from "@/components/prompt-compiler-artifact";

/** Local lite version of MDXComponents — avoids needing @types/mdx.
 *  Index signature covers HTML tags; custom components are added explicitly. */
type MDXComponents = {
  [K in keyof React.JSX.IntrinsicElements]?: (
    props: ComponentPropsWithoutRef<K> & { children?: ReactNode },
  ) => ReactNode;
} & {
  AnchorDemo?: typeof AnchorDemo;
  AnchorScrollytell?: typeof AnchorScrollytell;
  AnchorParallaxGallery?: typeof AnchorParallaxGallery;
  YouTubeEmbed?: typeof YouTubeEmbed;
  BrokerVideos?: typeof BrokerVideos;
  PhospheneScreen?: typeof PhospheneScreen;
  RoomboardScreen?: typeof RoomboardScreen;
  RoomboardThemeShowcase?: typeof RoomboardThemeShowcase;
  PromptCompilerArtifact?: typeof PromptCompilerArtifact;
};

/** Custom mapping of HTML elements → styled React components for MDXRemote.
 *  We intentionally don't use @tailwindcss/typography so it stays in our voice. */
export const mdxComponents: MDXComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "font-sans text-[36px] font-medium tracking-[-0.02em] text-fg mb-6 mt-12 first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "heading-gradient w-fit font-sans text-[22px] font-medium tracking-[-0.015em] mb-4 mt-10",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "font-sans text-[18px] font-medium tracking-[-0.01em] text-fg mb-3 mt-8",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("mb-4 leading-[1.7] text-fg-muted", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-medium text-fg", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("italic text-fg", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("mb-5 ml-4 list-disc marker:text-fg-dim space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("mb-5 ml-4 list-decimal marker:text-fg-dim space-y-2", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("text-fg-muted leading-[1.65]", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "border-b border-line text-fg transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]",
        className,
      )}
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-10 border-line-soft", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-6 border-l-2 border-line pl-4 italic text-fg",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-bg-2 px-1.5 py-0.5 font-mono text-[0.9em] text-fg",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-5 overflow-x-auto rounded-md border border-line-soft bg-bg-2 p-4 font-mono text-[12.5px] leading-[1.6]",
        className,
      )}
      {...props}
    />
  ),
  // Custom components usable directly in MDX:
  AnchorDemo,
  AnchorScrollytell,
  AnchorParallaxGallery,
  YouTubeEmbed,
  BrokerVideos,
  PhospheneScreen,
  RoomboardScreen,
  RoomboardThemeShowcase,
  PromptCompilerArtifact,
};
