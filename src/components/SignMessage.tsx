import { useState, useEffect } from "react";
import * as web3 from "@solana/web3.js";
import * as bip39 from "bip39";
import bs58 from "bs58";
import * as nacl from "tweetnacl";
import { HDKey } from "micro-ed25519-hdkey";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/Card";
import { Toast } from "./ui/Toast";
import { PhantomIcon, SolflareIcon, KeyIcon, SolanaIcon } from "../assets/wallets";
import { Copy, Check, KeyRound, FileText, Fingerprint, RefreshCw, Code } from "lucide-react";
import "./toggle.css";
import { Buffer } from "buffer";
import { CodeSnippet } from "./CodeSnippet";
import { generateCodeExamples } from "../utils/codeExamples";

window.Buffer = window.Buffer || Buffer;

type Provider = {
  publicKey: web3.PublicKey;
  signMessage(message: Uint8Array, encoding?: string): Promise<{ signature: Uint8Array }>;
  connect(): Promise<{ publicKey: web3.PublicKey }>;
  isPhantom?: boolean;
};

type PrivateKeyType = "base58" | "seedPhrase" | "uint8Array";

export function SignMessage() {
  const [message, setMessage] = useState("");
  const [signingMethod, setSigningMethod] = useState<"phantom" | "solflare" | "privateKey">("privateKey");
  const [privateKeyType, setPrivateKeyType] = useState<PrivateKeyType>("base58");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [signingAddress, setSigningAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", variant: "info" as "success" | "error" | "info" });
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [hasPhantom, setHasPhantom] = useState(false);
  const [hasSolflare, setHasSolflare] = useState(false);

  const [customPath, setCustomPath] = useState<string>("");
  const [useCustomPath, setUseCustomPath] = useState<boolean>(false);

  const [showCodeExamples, setShowCodeExamples] = useState<boolean>(false);
  const [codeExamples, setCodeExamples] = useState<Array<{ language: string; code: string; description?: string }>>([]);

  useEffect(() => {
    if (toastOpen) {
      const timer = setTimeout(() => {
        setToastOpen(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toastOpen]);

  useEffect(() => {
    const checkWallets = async () => {
      if (window.solana && window.solana.isPhantom) {
        setHasPhantom(true);
        setSigningMethod("phantom");
      }

      if (window.solflare) {
        setHasSolflare(true);
        if (!window.solana?.isPhantom) {
          setSigningMethod("solflare");
        }
      }
    };

    checkWallets();
  }, []);

  // Generate code examples when signing method or message changes
  useEffect(() => {
    const examples = generateCodeExamples(
      signingMethod,
      message,
      signingMethod === "privateKey" ? privateKeyType : undefined,
      signingMethod === "privateKey" ? privateKeyInput : undefined,
      signingMethod === "privateKey" && privateKeyType === "seedPhrase" ? useCustomPath : undefined,
      signingMethod === "privateKey" && privateKeyType === "seedPhrase" && useCustomPath ? customPath : undefined
    );
    setCodeExamples(examples);
  }, [signingMethod, message, privateKeyType, privateKeyInput, useCustomPath, customPath]);

  const handleReset = () => {
    setMessage("");
    if (hasPhantom) {
      setSigningMethod("phantom");
    } else if (hasSolflare) {
      setSigningMethod("solflare");
    } else {
      setSigningMethod("privateKey");
    }
    setPrivateKeyType("base58");
    setPrivateKeyInput("");
    setSigningAddress("");
    setSignature("");
    setHasSigned(false);
    setCustomPath("");
    setUseCustomPath(false);
    // Keep the code examples state
    // setShowCodeExamples(false);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);

      setToastMessage({
        title: "Copied to clipboard",
        description: `${type} has been copied to your clipboard.`,
        variant: "success",
      });
      setToastOpen(true);

      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const signWithPhantom = async () => {
    try {
      setIsLoading(true);
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet not found. Please install the extension.");
      }

      await window.solana.connect();
      const provider = window.solana;
      const account = provider.publicKey.toString();
      const messageBytes = new TextEncoder().encode(message);

      const { signature } = await provider.signMessage(messageBytes, "utf8");
      const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

      setSigningAddress(account);
      setSignature(signatureBase64);
      setHasSigned(true);

      setToastMessage({
        title: "Message signed successfully",
        description: "Your message has been signed with Phantom wallet.",
        variant: "success",
      });
      setToastOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setToastMessage({
        title: "Failed to sign message",
        description: errorMessage,
        variant: "error",
      });
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signWithSolflare = async () => {
    try {
      setIsLoading(true);
      if (!window.solflare) {
        throw new Error("Solflare wallet not found. Please install the extension.");
      }

      await window.solflare.connect();
      const provider = window.solflare;
      const account = provider.publicKey.toString();
      const messageBytes = new TextEncoder().encode(message);
      try {
        const { signature } = await provider.signMessage(messageBytes);
        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

        setSigningAddress(account);
        setSignature(signatureBase64);
        setHasSigned(true);

        setToastMessage({
          title: "Message signed successfully",
          description: "Your message has been signed with Solflare wallet.",
          variant: "success",
        });
        setToastOpen(true);
      } catch {
        throw new Error("Unable to sign with Solflare. Please make sure your wallet is unlocked.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";

      setToastMessage({
        title: "Failed to sign message",
        description: errorMessage,
        variant: "error",
      });
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signWithPrivateKey = async () => {
    try {
      setIsLoading(true);

      if (!message) {
        throw new Error("Please enter a message to sign");
      }

      if (!privateKeyInput) {
        throw new Error("Please enter a private key");
      }

      let privateKey: Uint8Array;
      switch (privateKeyType) {
        case "base58":
          try {
            privateKey = bs58.decode(privateKeyInput);
          } catch {
            throw new Error("Invalid base58 private key");
          }
          break;

        case "seedPhrase":
          try {
            const cleanedSeedPhrase = privateKeyInput.trim().replace(/\s+/g, " ");
            if (!cleanedSeedPhrase) {
              throw new Error("Please enter a seed phrase");
            }
            const words = cleanedSeedPhrase.split(" ");
            if (![12, 15, 18, 21, 24].includes(words.length)) {
              throw new Error(`Invalid seed phrase length: ${words.length} words. Expected 12, 15, 18, 21, or 24 words.`);
            }

            try {
              if (!bip39.validateMnemonic(cleanedSeedPhrase)) {
                console.warn("Warning: BIP39 validation failed, but continuing with derivation...");
              }
              const seed = bip39.mnemonicToSeedSync(cleanedSeedPhrase, "");

              let keypair: web3.Keypair | null = null;
              if (useCustomPath && customPath.trim()) {
                try {
                  const hdKey = HDKey.fromMasterSeed(seed.toString("hex"));
                  const derivedKey = hdKey.derive(customPath);
                  keypair = web3.Keypair.fromSeed(derivedKey.privateKey);
                } catch {
                  throw new Error(`Failed to derive keypair using path ${customPath}. Please check the path format.`);
                }
              } else {
                try {
                  keypair = web3.Keypair.fromSeed(seed.slice(0, 32));
                } catch {
                  try {
                    const defaultPath = "m/44'/501'/0'/0'";
                    const hdKey = HDKey.fromMasterSeed(seed.toString("hex"));
                    const derivedKey = hdKey.derive(defaultPath);
                    keypair = web3.Keypair.fromSeed(derivedKey.privateKey);
                  } catch {
                    throw new Error("Could not derive keypair using any method. Please check your seed phrase or try using a private key.");
                  }
                }
              }

              if (!keypair) {
                throw new Error("Could not derive keypair from any method. Please check your seed phrase or try using a private key.");
              }

              privateKey = keypair.secretKey;
            } catch {
              throw new Error("Unable to derive the correct keypair. Please try using your Base58 private key instead.");
            }
          } catch (error) {
            if (error instanceof Error) {
              throw error;
            } else {
              throw new Error("Failed to process the seed phrase");
            }
          }
          break;

        case "uint8Array":
          try {
            // Parse the uint8array string - expect a format like "[1,2,3,...]"
            const arrayData = JSON.parse(privateKeyInput);
            if (!Array.isArray(arrayData) || arrayData.length !== 64) {
              throw new Error("Private key should be an array of 64 bytes");
            }
            privateKey = new Uint8Array(arrayData);
          } catch {
            throw new Error("Invalid Uint8Array format. It should be a JSON array of 64 numbers");
          }
          break;

        default:
          throw new Error("Invalid private key type");
      }

      const keypair = web3.Keypair.fromSecretKey(privateKey);
      const messageBytes = new TextEncoder().encode(message);
      const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
      const signatureBase64 = btoa(String.fromCharCode(...signature));

      setSigningAddress(keypair.publicKey.toString());
      setSignature(signatureBase64);
      setHasSigned(true);

      setToastMessage({
        title: "Message signed successfully",
        description: "Your message has been signed with the provided private key.",
        variant: "success",
      });
      setToastOpen(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setToastMessage({
        title: "Failed to sign message",
        description: errorMessage,
        variant: "error",
      });
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async () => {
    if (message.trim() === "") {
      setToastMessage({
        title: "Missing message",
        description: "Please enter a message to sign.",
        variant: "error",
      });
      setToastOpen(true);
      return;
    }

    try {
      switch (signingMethod) {
        case "phantom":
          await signWithPhantom();
          break;
        case "solflare":
          await signWithSolflare();
          break;
        case "privateKey":
          await signWithPrivateKey();
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";

      setToastMessage({
        title: "Error",
        description: errorMessage,
        variant: "error",
      });
      setToastOpen(true);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className={`flex flex-col lg:flex-row gap-6 transition-all duration-300 ${showCodeExamples ? "lg:justify-between" : "lg:justify-center"}`}>
          <div className={`flex-1 lg:max-w-xl transition-all duration-300 ${showCodeExamples ? "" : "lg:mx-auto"}`}>
            <AnimatePresence mode="wait">
              {!hasSigned ? (
                <motion.div
                  key="sign-form-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card key="sign-form" variant="elevated" className="dark:bg-gray-800 bg-white">
                    <CardHeader className="py-4">
                      <div className="flex items-center">
                        <SolanaIcon size={32} className="flex-shrink-0 mr-3" />
                        <div className="flex-1">
                          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Sign a Message</h2>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Securely sign a message with your Solana wallet or private key</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="message" className="block text-sm font-medium">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 group-hover:text-solana-purple dark:group-hover:text-solana-blue transition-colors" size={18} />
                          <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the message you want to sign"
                            className="w-full min-h-[100px] pl-10 py-2.5 pr-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-solana-purple dark:focus:ring-solana-blue focus:border-transparent transition-all ext-compatible"
                            required
                            data-gramm="true"
                            spellCheck="true"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Select Signing Method</label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            type="button"
                            className={`relative flex items-center rounded-lg transition-all h-12 w-full px-4 ${
                              signingMethod === "phantom"
                                ? "bg-purple-100 dark:bg-purple-900/30 border-0"
                                : !hasPhantom
                                ? "border border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10"
                            }`}
                            onClick={() => hasPhantom && setSigningMethod("phantom")}
                            disabled={!hasPhantom}
                          >
                            <div className="flex items-center">
                              <PhantomIcon size={22} className="mr-3" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{hasPhantom ? "Phantom" : "Phantom Not Available"}</span>
                            </div>
                            {signingMethod === "phantom" && <motion.div layoutId="selectedMethod" className="absolute inset-0 border border-purple-300 dark:border-purple-500 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                          </button>

                          <button
                            type="button"
                            className={`relative flex items-center rounded-lg transition-all h-12 w-full px-4 ${
                              signingMethod === "solflare"
                                ? "bg-amber-100 dark:bg-amber-900/30 border-0"
                                : !hasSolflare
                                ? "border border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                : "border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                            }`}
                            onClick={() => hasSolflare && setSigningMethod("solflare")}
                            disabled={!hasSolflare}
                          >
                            <div className="flex items-center">
                              <SolflareIcon size={22} className="mr-3" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{hasSolflare ? "Solflare" : "Solflare Not Available"}</span>
                            </div>
                            {signingMethod === "solflare" && <motion.div layoutId="selectedMethod" className="absolute inset-0 border border-amber-500 dark:border-amber-500 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                          </button>

                          <button
                            type="button"
                            className={`relative flex items-center rounded-lg transition-all h-12 w-full px-4 ${
                              signingMethod === "privateKey" ? "bg-blue-100 dark:bg-blue-900/30 border-0" : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            }`}
                            onClick={() => setSigningMethod("privateKey")}
                          >
                            <div className="flex items-center">
                              <KeyIcon size={22} className="mr-3" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Private Key</span>
                            </div>
                            {signingMethod === "privateKey" && <motion.div layoutId="selectedMethod" className="absolute inset-0 border border-blue-400 dark:border-blue-500 rounded-lg" initial={false} transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
                          </button>
                        </div>

                        {(!hasPhantom || !hasSolflare) && (
                          <div className="mt-3 p-2.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-700/30">
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                              {!hasPhantom && !hasSolflare ? "No wallet extensions detected. Install a wallet or use a private key." : !hasPhantom ? "Phantom wallet not detected. Using Solflare or private key." : "Solflare wallet not detected. Using Phantom or private key."}
                            </p>
                            <div className="mt-1.5 flex gap-2 flex-wrap">
                              {!hasPhantom && (
                                <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 bg-white/80 dark:bg-gray-800/50 rounded border border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors">
                                  Install Phantom
                                </a>
                              )}
                              {!hasSolflare && (
                                <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 bg-white/80 dark:bg-gray-800/50 rounded border border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors">
                                  Install Solflare
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <AnimatePresence mode="wait">
                        {signingMethod === "privateKey" && (
                          <motion.div key="private-key-options" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="space-y-4 overflow-hidden">
                            <div>
                              <label className="block text-sm font-medium mb-2">Private Key Format</label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  className={`relative flex items-center justify-center px-3 py-2 rounded-md text-xs transition-colors ${
                                    privateKeyType === "base58" ? "bg-blue-100 dark:bg-blue-900/30 border-0 font-medium" : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                  }`}
                                  onClick={() => setPrivateKeyType("base58")}
                                >
                                  Base58
                                  {privateKeyType === "base58" && <div className="absolute inset-0 border border-blue-400 dark:border-blue-500 rounded-md pointer-events-none" />}
                                </button>
                                <button
                                  type="button"
                                  className={`relative flex items-center justify-center px-3 py-2 rounded-md text-xs transition-colors ${
                                    privateKeyType === "seedPhrase" ? "bg-blue-100 dark:bg-blue-900/30 border-0 font-medium" : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                  }`}
                                  onClick={() => setPrivateKeyType("seedPhrase")}
                                >
                                  Seed Phrase
                                  {privateKeyType === "seedPhrase" && <div className="absolute inset-0 border border-blue-400 dark:border-blue-500 rounded-md pointer-events-none" />}
                                </button>
                                <button
                                  type="button"
                                  className={`relative flex items-center justify-center px-3 py-2 rounded-md text-xs transition-colors ${
                                    privateKeyType === "uint8Array" ? "bg-blue-100 dark:bg-blue-900/30 border-0 font-medium" : "border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                                  }`}
                                  onClick={() => setPrivateKeyType("uint8Array")}
                                >
                                  Uint8Array
                                  {privateKeyType === "uint8Array" && <div className="absolute inset-0 border border-blue-400 dark:border-blue-500 rounded-md pointer-events-none" />}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="privateKey" className="block text-sm font-medium">
                                {privateKeyType === "base58" ? "Base58 Private Key" : privateKeyType === "seedPhrase" ? "Seed Phrase (12-24 words)" : "Uint8Array (as JSON array)"}
                              </label>
                              <div className="relative group">
                                <KeyRound className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 group-hover:text-solana-purple dark:group-hover:text-solana-blue transition-colors" size={18} />
                                {privateKeyType === "seedPhrase" ? (
                                  <div>
                                    <textarea
                                      id="privateKey"
                                      value={privateKeyInput}
                                      onChange={(e) => setPrivateKeyInput(e.target.value)}
                                      placeholder="Enter your 12-24 word seed phrase separated by spaces"
                                      className="w-full min-h-[80px] pl-10 py-2.5 pr-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-solana-purple dark:focus:ring-solana-blue focus:border-transparent transition-all ext-compatible"
                                      required
                                      data-gramm="false"
                                      spellCheck="false"
                                      autoComplete="off"
                                    />

                                    <div className="mt-2 flex flex-row gap-4 items-center">
                                      <label htmlFor="useCustomPath" className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                        Use Custom Path:
                                      </label>
                                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                        <input
                                          id="useCustomPath"
                                          type="checkbox"
                                          checked={useCustomPath}
                                          onChange={() => {
                                            const newValue = !useCustomPath;
                                            setUseCustomPath(newValue);
                                            if (newValue) {
                                              setCustomPath("m/44'/501'/0'/0'");
                                            } else {
                                              setCustomPath("");
                                            }
                                          }}
                                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out"
                                        />
                                        <label htmlFor="useCustomPath" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Use a specific derivation path</div>
                                    </div>

                                    {useCustomPath && (
                                      <div className="mt-2 flex flex-row gap-4 items-center">
                                        <label htmlFor="customPath" className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                          Custom Path:
                                        </label>
                                        <input
                                          id="customPath"
                                          type="text"
                                          value={customPath}
                                          onChange={(e) => setCustomPath(e.target.value)}
                                          placeholder="m/44'/501'/0'/0'"
                                          className="flex-1 h-8 pl-2 pr-2 text-xs border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-solana-purple dark:focus:ring-solana-blue focus:border-transparent transition-all font-mono"
                                        />
                                      </div>
                                    )}

                                    <div className="mt-1.5 flex flex-col">
                                      <div className="flex justify-between items-start">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          <p>The app uses the official Solana methods to derive keys from seed phrases:</p>
                                          <p className="mt-1">1. Direct method from seed bytes (no derivation path)</p>
                                          <p className="mt-1">
                                            2. BIP44 Solana derivation with paths like <code className="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">m/44'/501'/0'/0'</code>
                                          </p>
                                          <p className="mt-1 text-amber-600 dark:text-amber-400">If none work, use your wallet's exported private key instead.</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <button
                                            type="button"
                                            onClick={() => setPrivateKeyInput("nation goddess judge attend whip media access attack brother acquire sand vacant teach ranch robust weather sick reunion injury frame poet drop wash differ")}
                                            className="text-xs text-solana-purple dark:text-solana-blue hover:underline ml-2 whitespace-nowrap"
                                          >
                                            Test with example
                                          </button>
                                          <button type="button" onClick={() => setPrivateKeyType("base58")} className="text-xs text-gray-500 dark:text-gray-400 hover:underline ml-2 whitespace-nowrap">
                                            Switch to private key
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <input
                                    id="privateKey"
                                    type="text"
                                    value={privateKeyInput}
                                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                                    placeholder={privateKeyType === "base58" ? "Enter your base58 encoded private key" : "Enter your uint8array as JSON (e.g. [1,2,3,...])"}
                                    className="w-full h-10 pl-10 pr-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-solana-purple dark:focus:ring-solana-blue focus:border-transparent transition-all"
                                    required
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Code Examples</h3>
                          <button type="button" onClick={() => setShowCodeExamples(!showCodeExamples)} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <Code size={14} />
                            {showCodeExamples ? "Hide Code" : "Show Code"}
                          </button>
                        </div>

                        {/* Mobile-only code snippets - visible only on small screens */}
                        <div className="block lg:hidden">
                          <AnimatePresence>
                            {showCodeExamples && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mt-2">
                                  <CodeSnippet snippets={codeExamples} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={handleSign}
                        disabled={!message || isLoading}
                        isLoading={isLoading}
                        icon={<Fingerprint size={16} />}
                        className="flex items-center justify-center h-12 rounded-lg text-white text-sm bg-solana-purple hover:bg-purple-600 transition-colors border-0"
                      >
                        Sign Message
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="sign-result-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card key="sign-result" variant="elevated" className="dark:bg-gray-800 bg-white">
                    <CardHeader className="py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <Check className="text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-1.5 rounded-full" size={28} />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Message Signed</h2>
                          <div className="flex items-center mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className="mr-1">Signed with</span>
                            {signingMethod === "phantom" ? (
                              <div className="flex items-center">
                                <PhantomIcon size={12} className="mr-1" />
                                <span className="font-medium">Phantom</span>
                              </div>
                            ) : signingMethod === "solflare" ? (
                              <div className="flex items-center">
                                <SolflareIcon size={12} className="mr-1" />
                                <span className="font-medium">Solflare</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <KeyIcon size={12} className="mr-1" />
                                <span className="font-medium">Private Key</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Signing Address</h3>
                          <button onClick={() => copyToClipboard(signingAddress, "Address")} className="text-gray-500 hover:text-blue-300 dark:hover:text-blue-300 p-1 rounded-full transition-colors" aria-label="Copy address to clipboard">
                            {copiedText === "Address" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-x-auto">
                          <p className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">{signingAddress}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Message</h3>
                          <button onClick={() => copyToClipboard(message, "Message")} className="text-gray-500 hover:text-blue-300 dark:hover:text-blue-300 p-1 rounded-full transition-colors" aria-label="Copy message to clipboard">
                            {copiedText === "Message" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-x-auto">
                          <p className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">{message}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Signature (Base64)</h3>
                          <button onClick={() => copyToClipboard(signature, "Signature")} className="text-gray-500 hover:text-blue-300 dark:hover:text-blue-300 p-1 rounded-full transition-colors" aria-label="Copy signature to clipboard">
                            {copiedText === "Signature" ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-x-auto">
                          <p className="break-all font-mono text-xs text-gray-700 dark:text-gray-300">{signature}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium">Code Examples</h3>
                          <button type="button" onClick={() => setShowCodeExamples(!showCodeExamples)} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <Code size={14} />
                            {showCodeExamples ? "Hide Code" : "Show Code"}
                          </button>
                        </div>

                        {/* Mobile-only code snippets - visible only on small screens */}
                        <div className="block lg:hidden">
                          <AnimatePresence>
                            {showCodeExamples && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mt-2">
                                  <CodeSnippet snippets={codeExamples} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        variant="outlined"
                        size="md"
                        fullWidth
                        onClick={handleReset}
                        icon={<RefreshCw size={14} />}
                        className="flex items-center justify-center h-12 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        Sign Another Message
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Code Examples Panel for large screens - only visible on lg and above when showCodeExamples is true */}
          <motion.div 
            className="hidden lg:block h-fit"
            initial={false}
            animate={{
              width: showCodeExamples ? "600px" : "0px",
              opacity: showCodeExamples ? 1 : 0,
              marginLeft: showCodeExamples ? "24px" : "0px"
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {showCodeExamples && (
              <Card variant="elevated" className="dark:bg-gray-800 bg-white sticky top-4 overflow-hidden">
                <CardHeader className="py-4">
                  <div className="flex items-center">
                    <Code className="flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400" size={20} />
                    <div className="flex-1">
                      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Code Examples</h2>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Implement signing in your code</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CodeSnippet snippets={codeExamples} />
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      <Toast open={toastOpen} setOpen={setToastOpen} title={toastMessage.title} description={toastMessage.description} variant={toastMessage.variant} />
    </>
  );
}

// Add typing for window object to access wallet providers
declare global {
  interface Window {
    solana?: Provider & {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: web3.PublicKey }>;
      disconnect(): Promise<void>;
    };
    solflare?: Provider & {
      connect(): Promise<{ publicKey: web3.PublicKey }>;
      disconnect(): Promise<void>;
    };
  }
}
