type Props = {
  text: string;
  tone?: "normal" | "error";
};

export function StatusMessage({ text, tone = "normal" }: Props) {
  return <section className={`status ${tone}`}>{text}</section>;
}
