import { cn } from "@/lib/utils";

interface XandeumLogoProps {
  className?: string;
}

export default function XandeumLogo({ className }: XandeumLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-10", className)}
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <circle cx="50" cy="50" r="8" fill="currentColor"/>
      
      <circle cx="50" cy="15" r="5" fill="currentColor">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="80" cy="35" r="4" fill="currentColor">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="80" cy="65" r="4" fill="currentColor">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="85" r="5" fill="currentColor">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="65" r="4" fill="currentColor">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2.1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="35" r="4" fill="currentColor">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.7s" repeatCount="indefinite"/>
      </circle>
      
      <line x1="50" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="50" y1="50" x2="77" y2="37" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="50" y1="50" x2="77" y2="63" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="50" y1="50" x2="23" y2="63" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <line x1="50" y1="50" x2="23" y2="37" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}
