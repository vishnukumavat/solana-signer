export type SigningMethod = "phantom" | "solflare" | "privateKey";
export type PrivateKeyType = "base58" | "seedPhrase" | "uint8Array";

export function generateCodeExamples(
  signingMethod: SigningMethod, 
  message: string, 
  privateKeyType?: PrivateKeyType, 
  privateKeyInput?: string,
  useCustomPath?: boolean,
  customPath?: string
) {
  const sanitizedMessage = message.replace(/`/g, '\\`').replace(/'/g, "\\'").replace(/"/g, '\\"');
  
  const examples = [
    {
      language: "JavaScript",
      code: generateJavaScriptExample(signingMethod, sanitizedMessage, privateKeyType, privateKeyInput, useCustomPath, customPath),
      description: "Using @solana/web3.js in Node.js or browser"
    },
    {
      language: "Python",
      code: generatePythonExample(signingMethod, sanitizedMessage, privateKeyType, privateKeyInput, useCustomPath, customPath),
      description: "Using solana-py library"
    },
    {
      language: "Rust",
      code: generateRustExample(signingMethod, sanitizedMessage, privateKeyType, privateKeyInput, useCustomPath, customPath),
      description: "Using solana-sdk crate"
    },
    {
      language: "CLI",
      code: generateCLIExample(signingMethod, sanitizedMessage, privateKeyType),
      description: "Using Solana CLI tools"
    }
  ];

  return examples;
}

function generateJavaScriptExample(
  signingMethod: SigningMethod, 
  message: string,
  privateKeyType?: PrivateKeyType,
  privateKeyInput?: string,
  useCustomPath?: boolean,
  customPath?: string
): string {
  switch (signingMethod) {
    case "phantom":
      return `// Connect and sign with Phantom wallet in the browser
import * as web3 from "@solana/web3.js";

async function signWithPhantom() {
  // Check if Phantom is installed
  if (!window.solana || !window.solana.isPhantom) {
    throw new Error("Phantom wallet not found");
  }

  // Connect to the wallet
  await window.solana.connect();
  const provider = window.solana;
  
  // Create message bytes
  const message = "${message}";
  const messageBytes = new TextEncoder().encode(message);
  
  // Request the wallet to sign the message
  const { signature } = await provider.signMessage(messageBytes, "utf8");
  
  // Convert the signature to base64 for easy storage/transmission
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  console.log("Address:", provider.publicKey.toString());
  console.log("Message:", message);
  console.log("Signature (Base64):", signatureBase64);
  
  return {
    address: provider.publicKey.toString(),
    message,
    signature: signatureBase64
  };
}

signWithPhantom().catch(console.error);`;

    case "solflare":
      return `// Connect and sign with Solflare wallet in the browser
import * as web3 from "@solana/web3.js";

async function signWithSolflare() {
  // Check if Solflare is installed
  if (!window.solflare) {
    throw new Error("Solflare wallet not found");
  }

  // Connect to the wallet
  await window.solflare.connect();
  const provider = window.solflare;
  
  // Create message bytes
  const message = "${message}";
  const messageBytes = new TextEncoder().encode(message);
  
  // Request the wallet to sign the message
  const { signature } = await provider.signMessage(messageBytes);
  
  // Convert the signature to base64 for easy storage/transmission
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  console.log("Address:", provider.publicKey.toString());
  console.log("Message:", message);
  console.log("Signature (Base64):", signatureBase64);
  
  return {
    address: provider.publicKey.toString(),
    message,
    signature: signatureBase64
  };
}

signWithSolflare().catch(console.error);`;

    case "privateKey":
      if (privateKeyType === "base58") {
        return `// Sign a message with a base58 private key
import * as web3 from "@solana/web3.js";
import * as nacl from "tweetnacl";
import bs58 from "bs58";

async function signWithPrivateKey() {
  // Decode the private key from base58
  const privateKey = bs58.decode("${privateKeyInput || '<YOUR_PRIVATE_KEY>'}");
  
  // Create a keypair from the private key
  const keypair = web3.Keypair.fromSecretKey(privateKey);
  
  // Message to sign
  const message = "${message}";
  const messageBytes = new TextEncoder().encode(message);
  
  // Sign the message
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  
  // Convert the signature to base64 for easy storage/transmission
  const signatureBase64 = Buffer.from(signature).toString('base64');
  
  console.log("Address:", keypair.publicKey.toString());
  console.log("Message:", message);
  console.log("Signature (Base64):", signatureBase64);
  
  return {
    address: keypair.publicKey.toString(),
    message,
    signature: signatureBase64
  };
}

signWithPrivateKey().catch(console.error);`;
      } else if (privateKeyType === "seedPhrase") {
        let seedCode = "";
        if (useCustomPath) {
          seedCode = `
  // Use a specific derivation path
  const path = "${customPath || "m/44'/501'/0'/0'"}";
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  const hdKey = HDKey.fromMasterSeed(seed.toString("hex"));
  const derivedKey = hdKey.derive(path);
  const keypair = web3.Keypair.fromSeed(derivedKey.privateKey);`;
        } else {
          seedCode = `
  // Convert seed phrase to seed
  const seed = bip39.mnemonicToSeedSync(seedPhrase);
  
  // Create a keypair from the seed (first 32 bytes)
  const keypair = web3.Keypair.fromSeed(seed.slice(0, 32));`;
        }
        
        return `// Sign a message with a seed phrase
import * as web3 from "@solana/web3.js";
import * as nacl from "tweetnacl";
import * as bip39 from "bip39";
import { HDKey } from "micro-ed25519-hdkey";

async function signWithSeedPhrase() {
  // Your seed phrase
  const seedPhrase = "${privateKeyInput || 'your seed phrase here'}";${seedCode}
  
  // Message to sign
  const message = "${message}";
  const messageBytes = new TextEncoder().encode(message);
  
  // Sign the message
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  
  // Convert the signature to base64 for easy storage/transmission
  const signatureBase64 = Buffer.from(signature).toString('base64');
  
  console.log("Address:", keypair.publicKey.toString());
  console.log("Message:", message);
  console.log("Signature (Base64):", signatureBase64);
  
  return {
    address: keypair.publicKey.toString(),
    message,
    signature: signatureBase64
  };
}

signWithSeedPhrase().catch(console.error);`;
      } else if (privateKeyType === "uint8Array") {
        return `// Sign a message with a Uint8Array private key
import * as web3 from "@solana/web3.js";
import * as nacl from "tweetnacl";

async function signWithPrivateKey() {
  // Your private key as Uint8Array
  const privateKeyArray = ${privateKeyInput || '[/* your uint8array here */]'};
  const privateKey = new Uint8Array(privateKeyArray);
  
  // Create a keypair from the private key
  const keypair = web3.Keypair.fromSecretKey(privateKey);
  
  // Message to sign
  const message = "${message}";
  const messageBytes = new TextEncoder().encode(message);
  
  // Sign the message
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  
  // Convert the signature to base64 for easy storage/transmission
  const signatureBase64 = Buffer.from(signature).toString('base64');
  
  console.log("Address:", keypair.publicKey.toString());
  console.log("Message:", message);
  console.log("Signature (Base64):", signatureBase64);
  
  return {
    address: keypair.publicKey.toString(),
    message,
    signature: signatureBase64
  };
}

signWithPrivateKey().catch(console.error);`;
      }
      return "";
  }
  return "";
}

function generatePythonExample(
  signingMethod: SigningMethod, 
  message: string,
  privateKeyType?: PrivateKeyType,
  privateKeyInput?: string,
  useCustomPath?: boolean,
  customPath?: string
): string {
  if (signingMethod === "phantom" || signingMethod === "solflare") {
    return `# Python can't directly interface with browser wallets
# Please use a private key, or export your private key from the wallet

# For browser wallet integration, you would need to use JavaScript
# Please check the JavaScript example for ${signingMethod} wallet integration`;
  } else if (signingMethod === "privateKey") {
    if (privateKeyType === "base58") {
      return `# Sign a message with a base58 private key
import base58
import base64
from solana.keypair import Keypair
from solana.publickey import PublicKey

def sign_message():
    # Decode the private key from base58
    private_key_bytes = base58.b58decode("${privateKeyInput || '<YOUR_PRIVATE_KEY>'}") 
    
    # Create a keypair from the private key
    keypair = Keypair.from_secret_key(private_key_bytes)
    
    # Message to sign
    message = "${message}"
    message_bytes = bytes(message, "utf-8")
    
    # Sign the message
    signature = keypair.sign(message_bytes)
    
    # Convert the signature to base64 for easy storage/transmission
    signature_base64 = base64.b64encode(signature).decode("utf-8")
    
    print(f"Address: {keypair.public_key}")
    print(f"Message: {message}")
    print(f"Signature (Base64): {signature_base64}")
    
    return {
        "address": str(keypair.public_key),
        "message": message,
        "signature": signature_base64
    }

if __name__ == "__main__":
    sign_message()`;
    } else if (privateKeyType === "seedPhrase") {
      let derivationCode = "";
      if (useCustomPath) {
        derivationCode = `
    # Use a specific derivation path
    from hdwallet.hdwallet import HDWallet
    import binascii
    
    hdwallet = HDWallet()
    seed_hex = binascii.hexlify(seed).decode()
    hdwallet.from_seed(seed_hex)
    
    # Derive the private key using the path
    path = "${customPath || "m/44'/501'/0'/0'"}"
    derived_private_key = hdwallet.derive_path(path).private_key()
    keypair = Keypair.from_seed(bytes.fromhex(derived_private_key))`;
      } else {
        derivationCode = `
    # Create a keypair from the seed (first 32 bytes)
    keypair = Keypair.from_seed(seed[:32])`;
      }
      
      return `# Sign a message with a seed phrase
import base64
from mnemonic import Mnemonic
from solana.keypair import Keypair

def sign_message():
    # Your seed phrase
    seed_phrase = "${privateKeyInput || 'your seed phrase here'}"
    
    # Convert seed phrase to seed
    mnemo = Mnemonic("english")
    seed = mnemo.to_seed(seed_phrase)${derivationCode}
    
    # Message to sign
    message = "${message}"
    message_bytes = bytes(message, "utf-8")
    
    # Sign the message
    signature = keypair.sign(message_bytes)
    
    # Convert the signature to base64 for easy storage/transmission
    signature_base64 = base64.b64encode(signature).decode("utf-8")
    
    print(f"Address: {keypair.public_key}")
    print(f"Message: {message}")
    print(f"Signature (Base64): {signature_base64}")
    
    return {
        "address": str(keypair.public_key),
        "message": message,
        "signature": signature_base64
    }

if __name__ == "__main__":
    sign_message()`;
    } else if (privateKeyType === "uint8Array") {
      return `# Sign a message with a Uint8Array private key
import base64
from solana.keypair import Keypair

def sign_message():
    # Your private key as a list of integers
    private_key_array = ${privateKeyInput || '[/* your array here */]'}
    private_key_bytes = bytes(private_key_array)
    
    # Create a keypair from the private key
    keypair = Keypair.from_secret_key(private_key_bytes)
    
    # Message to sign
    message = "${message}"
    message_bytes = bytes(message, "utf-8")
    
    # Sign the message
    signature = keypair.sign(message_bytes)
    
    # Convert the signature to base64 for easy storage/transmission
    signature_base64 = base64.b64encode(signature).decode("utf-8")
    
    print(f"Address: {keypair.public_key}")
    print(f"Message: {message}")
    print(f"Signature (Base64): {signature_base64}")
    
    return {
        "address": str(keypair.public_key),
        "message": message,
        "signature": signature_base64
    }

if __name__ == "__main__":
    sign_message()`;
    }
  }
  return "";
}

function generateRustExample(
  signingMethod: SigningMethod, 
  message: string,
  privateKeyType?: PrivateKeyType,
  privateKeyInput?: string,
  useCustomPath?: boolean,
  customPath?: string
): string {
  if (signingMethod === "phantom" || signingMethod === "solflare") {
    return `// Rust can't directly interface with browser wallets
// Please use a private key, or export your private key from the wallet

// For browser wallet integration, you would need to use JavaScript
// Please check the JavaScript example for ${signingMethod} wallet integration`;
  } else if (signingMethod === "privateKey") {
    if (privateKeyType === "base58") {
      return `// Sign a message with a base58 private key
use solana_sdk::{
    signature::{Keypair, Signer},
    bs58,
};
use base64::{engine::general_purpose, Engine as _};

fn main() {
    // Decode the private key from base58
    let private_key_bytes = bs58::decode("${privateKeyInput || '<YOUR_PRIVATE_KEY>'}").into_vec().unwrap();
    
    // Create a keypair from the private key
    let keypair = Keypair::from_bytes(&private_key_bytes).unwrap();
    
    // Message to sign
    let message = "${message}";
    let message_bytes = message.as_bytes();
    
    // Sign the message
    let signature = keypair.sign_message(message_bytes);
    
    // Convert the signature to base64 for easy storage/transmission
    let signature_base64 = general_purpose::STANDARD.encode(signature.as_ref());
    
    println!("Address: {}", keypair.pubkey());
    println!("Message: {}", message);
    println!("Signature (Base64): {}", signature_base64);
}`;
    } else if (privateKeyType === "seedPhrase") {
      let derivationCode = "";
      if (useCustomPath) {
        derivationCode = `
    // Use a specific derivation path
    use tiny_hderive::bip32::ExtendedPrivKey;
    use hex::FromHex;
    
    let seed_hex = hex::encode(&seed);
    let xpriv = ExtendedPrivKey::derive(&seed_hex, "${customPath || "m/44'/501'/0'/0'"}").unwrap();
    let private_key = Vec::from_hex(xpriv.secret()).unwrap();
    let keypair = Keypair::from_bytes(&private_key).unwrap();`;
      } else {
        derivationCode = `
    // Create a keypair from the seed (first 32 bytes)
    let keypair = Keypair::from_seed(&seed[0..32]).unwrap();`;
      }
      
      return `// Sign a message with a seed phrase
use solana_sdk::{
    signature::{Keypair, Signer},
};
use bip39::{Mnemonic, Language, Seed};
use base64::{engine::general_purpose, Engine as _};

fn main() {
    // Your seed phrase
    let seed_phrase = "${privateKeyInput || 'your seed phrase here'}";
    
    // Convert seed phrase to seed
    let mnemonic = Mnemonic::from_phrase(seed_phrase, Language::English).unwrap();
    let seed = Seed::new(&mnemonic, "").as_bytes().to_vec();${derivationCode}
    
    // Message to sign
    let message = "${message}";
    let message_bytes = message.as_bytes();
    
    // Sign the message
    let signature = keypair.sign_message(message_bytes);
    
    // Convert the signature to base64 for easy storage/transmission
    let signature_base64 = general_purpose::STANDARD.encode(signature.as_ref());
    
    println!("Address: {}", keypair.pubkey());
    println!("Message: {}", message);
    println!("Signature (Base64): {}", signature_base64);
}`;
    } else if (privateKeyType === "uint8Array") {
      return `// Sign a message with a Uint8Array private key
use solana_sdk::{
    signature::{Keypair, Signer},
};
use base64::{engine::general_purpose, Engine as _};

fn main() {
    // Your private key as an array
    let private_key_array = ${privateKeyInput || '// Your array here'};
    
    // Create a keypair from the private key
    let keypair = Keypair::from_bytes(&private_key_array).unwrap();
    
    // Message to sign
    let message = "${message}";
    let message_bytes = message.as_bytes();
    
    // Sign the message
    let signature = keypair.sign_message(message_bytes);
    
    // Convert the signature to base64 for easy storage/transmission
    let signature_base64 = general_purpose::STANDARD.encode(signature.as_ref());
    
    println!("Address: {}", keypair.pubkey());
    println!("Message: {}", message);
    println!("Signature (Base64): {}", signature_base64);
}`;
    }
  }
  return "";
}

function generateCLIExample(
  signingMethod: SigningMethod, 
  message: string,
  privateKeyType?: PrivateKeyType,
  // Remove the unused parameters from the function signature
  // privateKeyInput?: string,
  // useCustomPath?: boolean,
  // customPath?: string
): string {
  if (signingMethod === "phantom" || signingMethod === "solflare") {
    return `# CLI can't directly interface with browser wallets
# Please use a private key, or export your private key from the wallet

# For browser wallet integration, you would need to use JavaScript
# Please check the JavaScript example for ${signingMethod} wallet integration`;
  } else if (signingMethod === "privateKey") {
    if (privateKeyType === "base58" || privateKeyType === "seedPhrase" || privateKeyType === "uint8Array") {
      return `# First, save your private key to a file (id.json) using your wallet export function
# or by converting your key to the Solana CLI format

# Then sign a message with the Solana CLI
echo -n "${message}" > message.txt
solana sign --keypair id.json message.txt

# This will output the signature and save it to message.txt.sig
# To view the signature in base64 format:
cat message.txt.sig | base64

# To view the public key (address) of your keypair:
solana-keygen pubkey id.json`;
    }
  }
  return "";
} 