import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// The storefront app proxy serves this app at /apps/lenscraft, but the server
// renders it as the /app route. The browser-side router reads the address bar,
// finds no route called /apps/lenscraft, and throws a 404. Point it at /app
// (same page, same UI) before hydrating so both sides agree.
const PROXY_PREFIX = "/apps/lenscraft";

if (window.location.pathname.startsWith(PROXY_PREFIX)) {
  const rest = window.location.pathname.slice(PROXY_PREFIX.length);
  window.history.replaceState(
    window.history.state,
    "",
    `/app${rest}${window.location.search}${window.location.hash}`,
  );
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});