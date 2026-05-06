export async function Log(stack, level, packageName, message) {
  const stacks = ["backend", "frontend"];
  const levels = ["debug", "info", "warn", "error", "fatal"];
  const backendPackages = ["handler", "repository", "route", "service"];
  const frontendPackages = ["api", "component", "hook", "page", "state", "style"];
  const commonPackages = ["auth", "config", "middleware", "utils"];

  const body = {
    stack,
    level,
    package: packageName,
    message: String(message)
  };

  try {
    const validCommon = commonPackages.includes(packageName);
    const validBackend = stack === "backend" && backendPackages.includes(packageName);
    const validFrontend = stack === "frontend" && frontendPackages.includes(packageName);

    if (!stacks.includes(stack) || !levels.includes(level) || (!validCommon && !validBackend && !validFrontend)) {
      return { ok: false, body };
    }

    const logUrl =
      (typeof process !== "undefined" && process.env?.LOGGING_API_URL) ||
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOGGING_API_URL) ||
      "";

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
