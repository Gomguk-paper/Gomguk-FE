import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

async function enableMocking() {
    // Enable MSW only in development mode
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    const { worker } = await import('./mocks/browser');

    // `worker.start()` returns a Promise that resolves
    // once the Service Worker is up and ready to intercept requests.
    return worker.start({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
}

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

enableMocking().then(() => {
    setupDevEnvironment();

    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
