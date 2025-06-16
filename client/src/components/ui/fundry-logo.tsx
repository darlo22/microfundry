import { Link } from "wouter";

interface FundryLogoProps {
  className?: string;
  linkToHome?: boolean;
}

export function FundryLogo({ className = "h-10 w-auto", linkToHome = true }: FundryLogoProps) {
  const logoSvg = (
    <svg 
      viewBox="0 0 800 600" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange mortar/pestle icon */}
      <g>
        {/* Pestle handle */}
        <path 
          d="M250 200L320 130C330 120 345 120 355 130L380 155C390 165 390 180 380 190L310 260"
          fill="#FF6B35" 
          stroke="#FF6B35" 
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Mortar bowl */}
        <path 
          d="M150 300C150 250 190 210 240 210H340C390 210 430 250 430 300V400C430 450 390 490 340 490H240C190 490 150 450 150 400V300Z"
          fill="#FF6B35"
          stroke="#FF6B35"
          strokeWidth="4"
        />
        
        {/* Inner bowl highlight */}
        <rect 
          x="190" 
          y="250" 
          width="200" 
          height="180" 
          rx="20" 
          fill="white"
        />
      </g>
      
      {/* "Fundry" text */}
      <g>
        <text 
          x="480" 
          y="380" 
          fontSize="140" 
          fontFamily="Inter, system-ui, sans-serif" 
          fontWeight="700" 
          fill="#1E3A8A"
        >
          Fundry
        </text>
      </g>
    </svg>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        {logoSvg}
      </Link>
    );
  }

  return logoSvg;
}

export default FundryLogo;