interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  return (
    <div className="bg-charcoal my-2 p-3 shadow-organic-card rounded-organic-code">
      {language && <span className="text-neutral-400 font-mono text-xs mb-2">{language}</span>}
      <div>
        <span className="text-neutral-50 font-mono text-sm">{code}</span>
      </div>
    </div>
  );
};

export default CodeBlock;
