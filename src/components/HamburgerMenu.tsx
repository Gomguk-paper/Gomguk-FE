import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

interface HamburgerMenuProps {
    className?: string;
}

export function HamburgerMenu({ className }: HamburgerMenuProps) {
    const { setMobileMenuOpen } = useStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="메뉴 열기"
        >
            <Menu className="w-5 h-5" />
        </Button>
    );
}
