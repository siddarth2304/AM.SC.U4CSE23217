import { Log } from "logging_middleware";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  Log("backend", "info", "config", `Backend started on port ${env.port}`);
});
