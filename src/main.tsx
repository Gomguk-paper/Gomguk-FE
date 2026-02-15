import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

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
