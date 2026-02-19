import type { Paper } from "@/models";
import { useStore } from "@/store/useStore";
import { MobileCard } from "./paper-card/MobileCard";
import { DesktopCard } from "./paper-card/DesktopCard";
import { useEffect, useState } from "react";

interface PaperCardProps {
  paper: Paper;
  onOpenSummary?: () => void;
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const { prefs } = useStore();
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  // Check screen width for responsive switching
  useEffect(() => {
    const checkWidth = () => {
      setIsMobileWidth(window.innerWidth < 768); // Tailwind 'md' breakpoint
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Determine which card to render
  // 1. If user forces mobile layout -> MobileCard
  // 2. If screen is small (< md) -> MobileCard
  // 3. Otherwise -> DesktopCard
  const showMobileCard = prefs?.layoutMode === 'mobile' || isMobileWidth;

  if (showMobileCard) {
    return <MobileCard paper={paper} onOpenSummary={onOpenSummary} />;
  }

  return <DesktopCard paper={paper} onOpenSummary={onOpenSummary} />;
}
