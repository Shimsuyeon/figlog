import { useEffect, useRef } from "react";
import type { AutoLogOptions, LogPayload } from "@figlog/schema";
import { buildEventName, buildPlacement } from "./helpers";

function extractLogData(element: HTMLElement) {
  const action = element.dataset.log!;
  const folder = element.dataset.logFolder ?? "";
  const component = element.dataset.logComponent ?? "";
  const id = element.dataset.logId;

  const screenEl = element.closest<HTMLElement>("[data-log-screen]");
  const screen = screenEl?.dataset.logScreen ?? element.dataset.logScreen;

  return { action, folder, component, id, screen };
}

function handleClickEvent(
  event: MouseEvent,
  domainMap: Record<string, string>,
  onLog: (eventType: string, payload: LogPayload) => void,
) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const logEl = target.closest<HTMLElement>('[data-log="click"]');
  if (!logEl) return;

  const { action, folder, component, id, screen } = extractLogData(logEl);

  const eventName = buildEventName({ action, folder, component, id, domainMap });
  const placement = buildPlacement({ screen, folder, domainMap });

  onLog("click", { eventName, placement });
}

/**
 * React hook for declarative auto-logging.
 * Call once at the app root. Automatically collects click and view events
 * from elements with `data-log` attributes via event delegation and IntersectionObserver.
 */
export function useAutoLog(options: AutoLogOptions): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const { domainMap, onLog } = optionsRef.current;

    const onClick = (e: MouseEvent) =>
      handleClickEvent(e, domainMap, onLog);

    document.addEventListener("click", onClick, true);

    const observed = new WeakSet<Element>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const el = entry.target as HTMLElement;
          intersectionObserver.unobserve(el);

          const { action, folder, component, id, screen } =
            extractLogData(el);
          const eventName = buildEventName({
            action,
            folder,
            component,
            id,
            domainMap,
          });
          const placement = buildPlacement({ screen, folder, domainMap });

          onLog("view", { eventName, placement });
        }
      },
      { threshold: 0.5 },
    );

    function observeViewElements(root: Element | Document = document) {
      const elements = root.querySelectorAll<HTMLElement>(
        '[data-log="view"]',
      );
      for (const el of elements) {
        if (observed.has(el)) continue;
        observed.add(el);
        intersectionObserver.observe(el);
      }
    }

    observeViewElements();

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as HTMLElement;

          if (el.dataset?.log === "view" && !observed.has(el)) {
            observed.add(el);
            intersectionObserver.observe(el);
          }

          observeViewElements(el);
        }
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      document.removeEventListener("click", onClick, true);
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
