// Import the image files from the images folder
import phantomIcon from './images/phantomIcon.png';
import solflareIcon from './images/solflareIcon.png';
import solanaIcon from './images/solanaIcon.png';
import privatekeyIcon from './images/privatekeyIcon.png';

export function PhantomIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <img
      src={phantomIcon}
      alt="Phantom Wallet"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%' }}
    />
  );
}

export function SolflareIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <img
      src={solflareIcon}
      alt="Solflare Wallet"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%' }}
    />
  );
}

export function SolanaIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <img
      src={solanaIcon}
      alt="Solana"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%' }}
    />
  );
}

export function KeyIcon({ className = '', size = 24 }: { className?: string; size?: number }) {
  return (
    <img
      src={privatekeyIcon}
      alt="Private Key"
      width={size}
      height={size}
      className={className}
    />
  );
} 