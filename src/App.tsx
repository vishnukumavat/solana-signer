import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { SignMessage } from './components/SignMessage';
import { SolanaIcon } from './assets/wallets';
import { Github } from 'lucide-react';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col relative bg-white/90 dark:bg-gray-900/95">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-solana-purple opacity-5 dark:opacity-10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 -left-40 w-80 h-80 bg-solana-blue opacity-5 dark:opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-purple-400 opacity-5 dark:opacity-10 rounded-full blur-3xl" />
        </div>

        <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <SolanaIcon size={38} />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-solana-purple to-solana-blue bg-clip-text text-transparent">
                  Solana Message Signer
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Securely sign messages with Solana wallets
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="https://github.com/vishnukumavat/solana-signer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github size={20} />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-10 flex-grow">
          <SignMessage />
        </main>
        
        <footer className="border-t border-gray-200 dark:border-gray-800 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md relative z-10 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Solana Message Signer
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-sm">
                <a 
                  href="https://github.com/vishnukumavat/solana-signer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-solana-purple dark:text-solana-blue hover:underline flex items-center justify-center sm:inline-flex"
                >
                  <Github size={16} className="mr-1" />
                  Open Source
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
