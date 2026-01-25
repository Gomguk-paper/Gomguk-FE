import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

async function enableMocking() {
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

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>
    );
});
