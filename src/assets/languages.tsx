// Import the image files from the images folder
import javascriptIcon from './images/javascriptIcon.png';
import pythonIcon from './images/pythonIcon.png';
import rustIcon from './images/rustIcon.png';
import cliIcon from './images/cliIcon.png';

interface IconProps {
  size?: number;
  className?: string;
}

export function JavaScriptIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img 
      src={javascriptIcon} 
      width={size} 
      height={size} 
      className={className} 
      alt="JavaScript Icon" 
    />
  );
}

export function PythonIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img 
      src={pythonIcon} 
      width={size} 
      height={size} 
      className={className} 
      alt="Python Icon" 
    />
  );
}

export function RustIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img 
      src={rustIcon} 
      width={size} 
      height={size} 
      className={className} 
      alt="Rust Icon" 
    />
  );
}

export function CLIIcon({ size = 16, className = "" }: IconProps) {
  return (
    <img 
      src={cliIcon} 
      width={size} 
      height={size} 
      className={className} 
      alt="CLI Icon" 
    />
  );
} 