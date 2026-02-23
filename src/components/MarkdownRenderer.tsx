import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = "" }: MarkdownRendererProps) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Enhanced code blocks with copy button
          code: ({ children, className: codeClassName, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const isInline = !match && !codeClassName;
            const codeString = String(children).replace(/\n$/, '');
            
            if (isInline) {
              return (
                <code 
                  className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono text-foreground" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <CodeBlock 
                code={codeString} 
                language={match ? match[1] : undefined} 
              />
            );
          },
          // Pre tag - let CodeBlock handle the wrapper
          pre: ({ children }) => <>{children}</>,
          // Customize links
          a: ({ children, href, ...props }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              {...props}
            >
              {children}
            </a>
          ),
          // Customize lists
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),
          // Customize headings
          h1: ({ children, ...props }) => (
            <h1 className="text-xl font-semibold mt-6 mb-3 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-lg font-semibold mt-5 mb-2 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          // Customize paragraphs
          p: ({ children, ...props }) => (
            <p className="leading-relaxed mb-3 last:mb-0" {...props}>
              {children}
            </p>
          ),
          // Customize blockquotes
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="border-l-3 border-primary/30 pl-4 my-3 italic text-muted-foreground" 
              {...props}
            >
              {children}
            </blockquote>
          ),
          // Customize horizontal rules
          hr: () => <hr className="my-6 border-border" />,
          // Customize tables
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-medium" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2" {...props}>
              {children}
            </td>
          ),
          // Strong and emphasis
          strong: ({ children, ...props }) => (
            <strong className="font-semibold" {...props}>{children}</strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic" {...props}>{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
