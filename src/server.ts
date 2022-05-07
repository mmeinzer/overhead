import Fastify, { FastifyInstance } from "fastify";

export function createServer() {
  const server: FastifyInstance = Fastify({});

  server.get("/overhead", async (_request, _reply) => {
    return { pong: "it worked!", test: "okay" };
  });

  return async () => {
    try {
      await server.listen(3000);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };
}
