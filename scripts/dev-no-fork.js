#!/usr/bin/env node

const { startServer } = require("next/dist/server/lib/start-server");

function getArgValue(name) {
  const index = process.argv.indexOf(name);

  if (index === -1) return undefined;

  return process.argv[index + 1];
}

function getPort() {
  const portArg = getArgValue("--port") || getArgValue("-p") || process.env.PORT;
  const port = Number(portArg || 3000);

  return Number.isFinite(port) ? port : 3000;
}

async function main() {
  process.env.__NEXT_DEV_SERVER = "1";
  process.env.NODE_ENV = process.env.NODE_ENV || "development";

  await startServer({
    dir: process.cwd(),
    port: getPort(),
    allowRetry: !process.env.PORT,
    isDev: true,
    hostname: getArgValue("--hostname") || getArgValue("-H"),
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
