import { Link } from "wouter";
import fundryLogoImg from "@assets/ChatGPT Image Jun 18, 2025, 07_16_52 AM_1750230510254.png";

interface FundryLogoProps {
  className?: string;
  linkToHome?: boolean;
}

export function FundryLogo({ className = "h-20 w-auto", linkToHome = true }: FundryLogoProps) {
  const logoImg = (
    <img 
      src={fundryLogoImg}
      alt="Fundry"
      className={className}
    />
  );

  if (linkToHome) {
    return (
      <Link href="/landing" className="flex items-center hover:opacity-80 transition-opacity">
        {logoImg}
      </Link>
    );
  }

  return logoImg;
}

export default FundryLogo;