import { useLocation } from "react-router-dom";
import { SidebarContent } from "./SidebarContent";

export function DesktopSidebar() {
    const location = useLocation();

    // Hide on login and onboarding pages
    if (location.pathname === "/login" || location.pathname === "/onboarding") {
        return null;
    }

    return (
        <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 flex-col border-r z-40">
            <SidebarContent />
        </aside>
    );
}
