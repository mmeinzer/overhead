import { createServer } from "./server/server";

async function main() {
  const startServer = createServer();
  await startServer();
}

main();
