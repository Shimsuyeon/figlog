export type EventType = "click" | "view";

export interface LogEvent {
  eventType: EventType;
  eventName: string;
  description?: string;
  actionType?: string;
}

export interface LogScreen {
  name: string;
  placement: string;
  events: LogEvent[];
}

export interface LogSpec {
  domain: string;
  screens: LogScreen[];
}

export interface AutoLogOptions {
  /** Mapping from folder name to domain name, e.g. { shop: 'OnlineShop' } */
  domainMap: Record<string, string>;
  /** Callback invoked on every log event instead of a hardcoded bridge call */
  onLog: (eventType: string, payload: LogPayload) => void;
}

export interface LogPayload {
  eventName: string;
  placement: string;
  [key: string]: unknown;
}
