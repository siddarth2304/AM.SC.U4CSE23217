export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type PackageName =
  | "handler"
  | "repository"
  | "route"
  | "service"
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string
): Promise<{
  ok: boolean;
  body: {
    stack: Stack;
    level: Level;
    package: PackageName;
    message: string;
  };
}>;
