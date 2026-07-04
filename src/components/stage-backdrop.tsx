/**
 * Fills the empty gutters around a WorkStage with a neutral technical frame.
 * The hero owns the lime glow; work stages get quiet lines instead of orbs.
 */
export function StageBackdrop({ flip }: { flip: boolean }) {
  return (
    <div
      aria-hidden
      className="stage-technical-backdrop pointer-events-none absolute inset-0"
      data-flip={flip ? "true" : "false"}
    >
      <div className="stage-grid absolute inset-0" />
      <span className="stage-scanline stage-scanline--primary" />
      <span className="stage-corner stage-corner--top" />
      <span className="stage-corner stage-corner--bottom" />
    </div>
  );
}
