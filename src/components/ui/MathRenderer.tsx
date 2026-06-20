'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import { parseMathText } from '@/lib/textParser';

interface MathRendererProps {
  text: string;
  className?: string;
}

export function MathRenderer({ text, className }: MathRendererProps) {
  const tokens = useMemo(() => {
    return parseMathText(text);
  }, [text]);

  if (!tokens || tokens.length === 0) {
    return null;
  }

  return (
    <span className={className}>
      {tokens.map((token, index) => {
        if (token.type === 'text') {
          return <span key={index}>{token.content}</span>;
        }

        try {
          const html = katex.renderToString(token.content, {
            displayMode: token.type === 'block-math',
            throwOnError: false,
          });
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: html }}
              className={token.type === 'block-math' ? 'block my-2 text-center' : 'inline-block mx-0.5'}
            />
          );
        } catch (e) {
          console.error('KaTeX rendering error: ', e);
          return (
            <span key={index} className="text-destructive font-mono">
              {token.content}
            </span>
          );
        }
      })}
    </span>
  );
}
