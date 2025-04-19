import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { JavaScriptIcon, PythonIcon, RustIcon, CLIIcon } from "../assets/languages";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeSnippetProps {
  snippets: {
    language: string;
    code: string;
    description?: string;
  }[];
}

export function CodeSnippet({ snippets }: CodeSnippetProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(snippets[0]?.language || "");
  const [copiedLanguage, setCopiedLanguage] = useState<string | null>(null);

  // Detect dark mode using CSS media query
  const isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  // Use state to keep track of theme changes
  const [isDark, setIsDark] = useState(isDarkMode);

  // Add listener for theme changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    setIsDark(e.matches);
  });

  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedLanguage(language);

      setTimeout(() => {
        setCopiedLanguage(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case "JavaScript":
        return <JavaScriptIcon size={14} className="mr-1.5" />;
      case "Python":
        return <PythonIcon size={14} className="mr-1.5" />;
      case "Rust":
        return <RustIcon size={14} className="mr-1.5" />;
      case "CLI":
        return <CLIIcon size={14} className="mr-1.5" />;
      default:
        return null;
    }
  };

  // Map our language names to prism's syntax names
  const getPrismLanguage = (language: string) => {
    switch (language) {
      case "JavaScript":
        return "javascript";
      case "Python":
        return "python";
      case "Rust":
        return "rust";
      case "CLI":
        return "bash";
      default:
        return "javascript";
    }
  };

  const selectedSnippet = snippets.find((snippet) => snippet.language === selectedLanguage);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {snippets.map((snippet) => (
          <button
            key={snippet.language}
            type="button"
            className={`text-xs px-3 py-1.5 rounded-md transition-colors flex items-center ${
              selectedLanguage === snippet.language ? "bg-gray-100 dark:bg-gray-800 ring-2 ring-blue-400 dark:ring-blue-500 font-medium" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => setSelectedLanguage(snippet.language)}
          >
            {getLanguageIcon(snippet.language)}
            {snippet.language}
          </button>
        ))}
      </div>

      {selectedSnippet && (
        <div className="relative">
          <div className="absolute right-2 top-2 z-10">
            <button
              type="button"
              onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.language)}
              className="p-1.5 rounded-md bg-gray-100/90 dark:bg-gray-800/90 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label={`Copy ${selectedSnippet.language} code`}
            >
              {copiedLanguage === selectedSnippet.language ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            {selectedSnippet.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-4 pt-3">{selectedSnippet.description}</p>}
            <div className="overflow-x-auto text-xs font-mono">
              <SyntaxHighlighter
                language={getPrismLanguage(selectedSnippet.language)}
                style={isDark ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: "0.75rem",
                  lineHeight: 1.5,
                }}
                showLineNumbers={true}
                wrapLongLines={false}
              >
                {selectedSnippet.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
