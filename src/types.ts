export const FORMAT_VERSION = 2 as const;

export type InteractionKind = "click" | "input" | "submit" | "navigation";
export type SelectorConfidence = "high" | "medium" | "low" | "unknown";

export interface EventBase {
  id: string;
  at: string;
  url: string;
}

export interface InteractionEvent extends EventBase {
  type: "interaction";
  kind: InteractionKind;
  selector?: string;
  selectorConfidence?: SelectorConfidence;
  fieldName?: string;
  value?: string;
}

export interface ConsoleErrorEvent extends EventBase {
  type: "console-error";
  message: string;
}

export interface NetworkFailureEvent extends EventBase {
  type: "network-failure";
  method: string;
  status: number;
  requestHeaders?: Record<string, string>;
}

export interface WarningEvent extends EventBase {
  type: "warning";
  message: string;
}

export type CaptureEvent = InteractionEvent | ConsoleErrorEvent | NetworkFailureEvent | WarningEvent;

export interface CapsuleSummary {
  interactions: number;
  consoleErrors: number;
  networkFailures: number;
  warnings: number;
}

export interface CapsuleManifest {
  formatVersion: typeof FORMAT_VERSION;
  capsuleId: string;
  createdAt: string;
  eventCount: number;
  summary: CapsuleSummary;
  files: Record<"events.json" | "replay.spec.ts" | "report.html", string>;
}

export interface VerificationResult {
  valid: boolean;
  capsuleId?: string;
  signals: string[];
  errors: string[];
}
