import fastify from "fastify";
import { FlightService } from "../flights/service";
declare module "fastify" {
  export interface FastifyInstance {
    flightService: FlightService;
  }
}
