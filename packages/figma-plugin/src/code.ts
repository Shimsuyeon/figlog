const PLUGIN_DATA_KEY = "figlog-events";

interface LogEventData {
  eventType: "click" | "view";
  eventName: string;
  placement: string;
  description?: string;
  group?: string;
}

figma.showUI(__html__, { width: 400, height: 520 });

figma.ui.onmessage = (msg: { type: string; payload?: unknown }) => {
  if (msg.type === "save-event") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify("Please select a layer first.");
      return;
    }

    const node = selection[0];
    const existing = getEvents(node);
    const newEvent = msg.payload as LogEventData;
    existing.push(newEvent);
    node.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(existing));

    figma.notify(`Event "${newEvent.eventName}" saved to ${node.name}`);
    figma.ui.postMessage({ type: "saved", nodeName: node.name });
  }

  if (msg.type === "export-spec") {
    const spec = buildSpec();
    figma.ui.postMessage({ type: "spec-exported", spec });
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};

function getEvents(node: SceneNode): LogEventData[] {
  const raw = node.getPluginData(PLUGIN_DATA_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

function buildSpec() {
  const page = figma.currentPage;
  const screenMap = new Map<
    string,
    { name: string; placement: string; events: Omit<LogEventData, "placement" | "group">[] }
  >();

  page.findAll((node) => {
    const raw = node.getPluginData(PLUGIN_DATA_KEY);
    if (!raw) return false;

    const events: LogEventData[] = JSON.parse(raw);
    for (const event of events) {
      const key = event.placement;
      if (!screenMap.has(key)) {
        screenMap.set(key, {
          name: event.group ?? key,
          placement: key,
          events: [],
        });
      }
      screenMap.get(key)!.events.push({
        eventType: event.eventType,
        eventName: event.eventName,
        description: event.description,
      });
    }
    return false;
  });

  return {
    domain: page.name,
    screens: Array.from(screenMap.values()),
  };
}
