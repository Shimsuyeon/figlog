const PLUGIN_DATA_KEY = "figlog-events";

interface LogEventData {
  eventType: "click" | "view";
  eventName: string;
  placement: string;
  description?: string;
  group?: string;
}

interface NodeEventGroup {
  nodeId: string;
  nodeName: string;
  events: LogEventData[];
}

figma.showUI(__html__, { width: 420, height: 640 });

figma.on("selectionchange", () => {
  sendSelectionEvents();
});

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
    sendSelectionEvents();
    sendAllEvents();
  }

  if (msg.type === "update-event") {
    const { nodeId, index, event } = msg.payload as {
      nodeId: string;
      index: number;
      event: LogEventData;
    };
    const node = figma.getNodeById(nodeId) as SceneNode | null;
    if (!node) return;

    const events = getEvents(node);
    if (index >= 0 && index < events.length) {
      events[index] = event;
      node.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(events));
      figma.notify(`Event "${event.eventName}" updated`);
      sendSelectionEvents();
      sendAllEvents();
    }
  }

  if (msg.type === "delete-event") {
    const { nodeId, index } = msg.payload as { nodeId: string; index: number };
    const node = figma.getNodeById(nodeId) as SceneNode | null;
    if (!node) return;

    const events = getEvents(node);
    if (index >= 0 && index < events.length) {
      const removed = events.splice(index, 1)[0];
      node.setPluginData(PLUGIN_DATA_KEY, JSON.stringify(events));
      figma.notify(`Event "${removed.eventName}" deleted`);
      sendSelectionEvents();
      sendAllEvents();
    }
  }

  if (msg.type === "focus-node") {
    const { nodeId } = msg.payload as { nodeId: string };
    const node = figma.getNodeById(nodeId) as SceneNode | null;
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }

  if (msg.type === "request-selection-events") {
    sendSelectionEvents();
    sendAllEvents();
  }

  if (msg.type === "export-spec") {
    const spec = buildSpec();
    figma.ui.postMessage({ type: "spec-exported", spec });
  }

  if (msg.type === "close") {
    figma.closePlugin();
  }
};

function sendSelectionEvents() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: "selection-events",
      nodeName: null,
      nodeId: null,
      events: [],
    });
    return;
  }
  const node = selection[0];
  const events = getEvents(node);
  figma.ui.postMessage({
    type: "selection-events",
    nodeName: node.name,
    nodeId: node.id,
    events,
  });
}

function sendAllEvents() {
  const groups: NodeEventGroup[] = [];
  figma.currentPage.findAll((node) => {
    const raw = node.getPluginData(PLUGIN_DATA_KEY);
    if (!raw) return false;
    try {
      const events: LogEventData[] = JSON.parse(raw);
      if (events.length > 0) {
        groups.push({ nodeId: node.id, nodeName: node.name, events });
      }
    } catch (_) {
      /* ignore malformed data */
    }
    return false;
  });
  figma.ui.postMessage({ type: "all-events", groups });
}

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
    {
      name: string;
      placement: string;
      events: Omit<LogEventData, "placement" | "group">[];
    }
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
