import Fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import fp from "fastify-plugin";
import traps from "@dnlup/fastify-traps";
import { FlightService } from "../flights/service";

export function createServer() {
  const fastify: FastifyInstance = Fastify({
    logger: true,
  });

  // ORDER:
  // └── plugins (from the Fastify ecosystem)
  // └── your plugins (your custom plugins)
  // └── decorators
  // └── hooks
  // └── your services
  fastify.register(traps);
  fastify.register(fp(decorateFastifyInstance));
  fastify.register(routes);

  return async () => {
    try {
      await fastify.listen(3000, "0.0.0.0");
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
}

async function decorateFastifyInstance(fastify: FastifyInstance) {
  const flightService = new FlightService();
  await flightService.initialize();
  fastify.decorate("flightService", flightService);
}

async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get("/overhead", async function (_req, _reply) {
    return this.flightService.overheadFlight();
  });
}
