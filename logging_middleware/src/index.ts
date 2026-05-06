export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";

type BackendPackage = "handler" | "repository" | "route" | "service";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
type CommonPackage = "auth" | "config" | "middleware" | "utils";

export type PackageName = BackendPackage | FrontendPackage | CommonPackage;

const stacks: Stack[] = ["backend", "frontend"];
const levels: Level[] = ["debug", "info", "warn", "error", "fatal"];
const backendPackages: string[] = ["handler", "repository", "route", "service"];
const frontendPackages: string[] = ["api", "component", "hook", "page", "state", "style"];
const commonPackages: string[] = ["auth", "config", "middleware", "utils"];

type LogResult = {
  ok: boolean;
  body: {
    stack: Stack;
    level: Level;
    package: PackageName;
    message: string;
  };
};

function getLogUrl() {
  if (typeof process !== "undefined" && process.env?.LOGGING_API_URL) {
    return process.env.LOGGING_API_URL;
  }

  try {
    const meta = import.meta as ImportMeta & { env?: { VITE_LOGGING_API_URL?: string } };
    const env = meta.env;
    return env?.VITE_LOGGING_API_URL || "";
  } catch {
    return "";
  }
}

function isValidPackage(stack: Stack, packageName: PackageName) {
  if (commonPackages.includes(packageName)) {
    return true;
  }

  if (stack === "backend") {
    return backendPackages.includes(packageName);
  }

  return frontendPackages.includes(packageName);
}

export async function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string
): Promise<LogResult> {
  const body = {
    stack,
    level,
    package: packageName,
    message: String(message)
  };

  try {
    if (!stacks.includes(stack) || !levels.includes(level) || !isValidPackage(stack, packageName)) {
      return { ok: false, body };
    }

    const logUrl = getLogUrl();
    if (!logUrl || typeof fetch !== "function") {
      return { ok: false, body };
    }

    const response = await fetch(logUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return { ok: response.ok, body };
  } catch {
    return { ok: false, body };
  }
}
