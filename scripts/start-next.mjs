import { spawn } from "node:child_process";
import net from "node:net";

const mode = process.argv[2];
const allowedModes = new Set(["dev", "start"]);

if (!allowedModes.has(mode)) {
  console.error("[portfolio] usage: node scripts/start-next.mjs <dev|start>");
  process.exit(1);
}

const requestedPort = Number.parseInt(process.env.PORT || "3010", 10);

if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  console.error(`[portfolio] invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

async function findOpenPort(startPort) {
  for (let port = startPort; port <= Math.min(startPort + 50, 65535); port += 1) {
    if (await canListen(port)) return port;
  }

  return null;
}

const isProductionStart = mode === "start" || process.env.NODE_ENV === "production";
const port = isProductionStart ? (await canListen(requestedPort) ? requestedPort : null) : await findOpenPort(requestedPort);

if (!port) {
  if (isProductionStart) {
    console.error(`[portfolio] requested production port ${requestedPort} is unavailable.`);
    process.exit(1);
  }

  console.error(`[portfolio] no open port found from ${requestedPort} to ${Math.min(requestedPort + 50, 65535)}`);
  process.exit(1);
}

if (port !== requestedPort) {
  console.warn(`[portfolio] port ${requestedPort} is busy; using ${port} instead.`);
}

const child = spawn("next", [mode, "--port", String(port)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("error", (error) => {
  console.error(`[portfolio] failed to start Next.js: ${error.stack || error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
