import type { CSSProperties, ReactNode } from "react";

// Minimal, injection-safe Markdown renderer. It builds React elements directly
// (never dangerouslySetInnerHTML), so any raw HTML in the source renders as
// plain text. Supports: # ## ### headings, **bold**, *italic*, `code`,
// [text](https://…) links, and - / 1. lists.

const codeStyle: CSSProperties = {
  fontFamily: "var(--font-mono), ui-monospace, monospace",
  fontSize: "0.9em",
  background: "var(--bg-2)",
  padding: "1px 5px",
  borderRadius: 3,
};

const linkStyle: CSSProperties = {
  color: "var(--fg)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={key}>{m[2]}</em>);
    else if (m[3] !== undefined)
      out.push(
        <code key={key} style={codeStyle}>
          {m[3]}
        </code>
      );
    else if (m[4] !== undefined)
      out.push(
        <a
          key={key}
          href={m[5]}
          target="_blank"
          rel="noreferrer noopener"
          style={linkStyle}
        >
          {m[4]}
        </a>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({
  markdown,
  style,
}: {
  markdown: string;
  style?: CSSProperties;
}) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={key++} style={{ margin: "0 0 12px", lineHeight: 1.6 }}>
          {inline(para.join(" "), `p${key}`)}
        </p>
      );
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (!t) {
      flushPara();
      i++;
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(t);
    if (heading) {
      flushPara();
      const size = [22, 18, 15][heading[1].length - 1];
      blocks.push(
        <div
          key={key++}
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: size,
            letterSpacing: "-0.01em",
            margin: "8px 0 6px",
          }}
        >
          {inline(heading[2], `h${key}`)}
        </div>
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(t)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.6 }}>
          {items.map((it, idx) => (
            <li key={idx}>{inline(it, `ul${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(t)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.6 }}>
          {items.map((it, idx) => (
            <li key={idx}>{inline(it, `ol${key}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    para.push(t);
    i++;
  }
  flushPara();

  return <div style={style}>{blocks}</div>;
}
