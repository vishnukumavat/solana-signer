# Solana Message Signer

A modern React application for signing messages using various Solana wallet options.

## Features

- Sign messages with different methods:
  - Phantom Wallet Extension
  - Solflare Wallet Extension
  - Private Key (multiple formats supported)
- Support for multiple private key formats:
  - Base58 string
  - Seed phrase (12-24 words)
  - Uint8Array
- Clean, responsive UI with Tailwind CSS
- Light and dark theme support (Solana-inspired colors)
- Proper error handling for all signing methods

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- For wallet extension signing: Phantom and/or Solflare browser extensions installed

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd solana-signer
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage

1. Enter a message you want to sign
2. Choose a signing method (Phantom, Solflare, or Private Key)
3. If using a wallet extension, the extension will prompt you to connect and sign
4. If using a private key, select the key format and enter your key
5. View the signing result (address, message, and signature)
6. Use the Reset button to start over

## Building for Production

```bash
npm run build
```

This will create a production-ready build in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Solana Web3.js
- TweetNaCl
- bip39 (for seed phrase handling)
- bs58 (for Base58 encoding/decoding)

## License

MIT
