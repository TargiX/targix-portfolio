export function Typed({ text }: { text: string }) {
  return (
    <>
      {text}
      <span className="caret" aria-hidden="true" />
    </>
  );
}
