import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import remarkBreaks from 'remark-breaks';

export default function CustomMarkdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      {...props}
    />
  );
}
