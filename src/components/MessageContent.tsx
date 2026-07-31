"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-[#0d1117] px-4 py-1.5 text-xs text-muted">
        <span className="font-mono">{language || "text"}</span>
        <button
          onClick={handleCopy}
          className="rounded px-2 py-0.5 transition hover:bg-white/10 hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, padding: "1rem", fontSize: "0.85rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose-sm max-w-none [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children } = props;
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.85em]">
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match?.[1] || ""}
                code={String(children).replace(/\n$/, "")}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
