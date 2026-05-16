import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UI_CONSTANTS } from "@/core/config/constants";
import { Megaphone } from "lucide-react";

interface AdSenseCardProps {
  className?: string;
}

export function AdSenseCard({ className }: AdSenseCardProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    try {
      if (adRef.current && !isLoaded.current) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <article
      className={cn(
        "bg-card rounded-lg border shadow-card overflow-hidden",
        "flex flex-col md:p-4",
        className
      )}
    >
      {/* Ad Header (Instagram style sponsored indicator) */}
      <div className="flex items-center gap-2 p-4 md:p-0 mb-3 border-b md:border-b-0 pb-3 md:pb-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Megaphone className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm leading-snug text-foreground">
            Sponsor
          </h3>
          <div className="text-xs text-muted-foreground">광고</div>
        </div>
      </div>

      {/* Ad Content Area */}
      <div className="flex-1 flex flex-col px-4 pb-4 md:px-0 md:pb-0 justify-center items-center bg-muted/10 rounded-md py-4 min-h-[200px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client={UI_CONSTANTS.ADSENSE.CLIENT_ID}
          data-ad-slot={UI_CONSTANTS.ADSENSE.SLOT_ID}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </article>
  );
}
