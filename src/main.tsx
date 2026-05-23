import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles/index.css";
import App from "./App.tsx";

// Register service worker for PWA
registerSW({ immediate: true });

// Set up dev environment
function setupDevEnvironment() {
    if (process.env.NODE_ENV === 'development') {
        // Set a temporary access token for development if not exists
        if (!localStorage.getItem('access_token')) {
            console.log('[Dev] Setting temporary access token');
            localStorage.setItem('access_token', 'dev_temporary_token_for_testing');
        }
    }
}

setupDevEnvironment();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
