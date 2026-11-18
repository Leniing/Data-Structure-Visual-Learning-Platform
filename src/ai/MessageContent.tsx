import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MessageContent({ text }: { text: string }) {
  return <Markdown remarkPlugins={[remarkGfm]} components={{
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
    img: ({ alt }) => <span>{alt || '图片'}</span>,
    table: ({ children }) => <div className="ai-markdown-table"><table>{children}</table></div>,
  }}>{text}</Markdown>
}
