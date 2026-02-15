import { useStore } from "@/store/useStore";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";
import { useLocation } from "react-router-dom";

export function MobileSidebar() {
    const { mobileMenuOpen, setMobileMenuOpen } = useStore();
    const location = useLocation();

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    return (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
                <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
