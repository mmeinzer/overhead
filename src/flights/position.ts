import got, { Got, Response, Options, Headers } from "got";
import { EventEmitter } from "stream";
import { bufferToLocations, Aircraft } from "./convert";

export class PositionUpdater {
  static readonly #API_BASE = "https://globe.adsbexchange.com";
  static readonly #GLOBAL_RATES_ENDPOINT = `globeRates.json`;
  static readonly #POSITIONS_BIN_ENDPOINT = `data/globe_6352.binCraft`;
  static readonly #COOKIE_NAME = "adsbx_sid";

  readonly #client: Got;
  readonly #emitter = new EventEmitter();
  readonly #UPDATE_EVENT = Symbol("updateEvent");

  #cookie: string;
  #returnedRateLimitMs: number = 2000;
  #intervalId: NodeJS.Timer | null = null; // TODO: can be used to implement a stop function
  #airplanes: Aircraft[] = [];

  constructor() {
    this.#cookie = PositionUpdater.generateCookie();
    this.#client = got.extend({
      prefixUrl: PositionUpdater.#API_BASE,
      headers: this.clientHeaders(),
      retry: 0,
    });
  }

  async start(): Promise<void> {
    const rateLimit = await this.activateCookieViaRateLimitEndpoint();
    if (rateLimit === null) {
      console.error("Failed to activate cookie");
      return;
    }

    this.#intervalId = setInterval(
      this.updateFlightData.bind(this),
      this.#returnedRateLimitMs
    );
  }

  /**
   * Attempts to reset the cookie in order to recover from failing ADS-B exchange API requests
   */
  private async resetAndActivateClientCookie(): Promise<void> {
    this.#cookie = PositionUpdater.generateCookie();
    const options: Options = {
      headers: this.clientHeaders(),
    };
    this.#client.mergeOptions(options);
    const rateLimit = await this.activateCookieViaRateLimitEndpoint();
    if (rateLimit === null) {
      console.error("Failed to activate new cookie");
    }
  }

  onUpdate(cb: AircraftUpdateHandler): void {
    this.#emitter.on(this.#UPDATE_EVENT, cb);
  }

  // This method is directly from the ADS-B exchange JS
  private static generateCookie(): string {
    const randomBytes = Math.random().toString(36).substring(2, 15);

    const timeNowMs = new Date().getTime();
    const twoDaysMs = 2 * 86400 * 1000; // Two days in ms
    const expiresAtMs = timeNowMs + twoDaysMs;

    const cookieVal = `${expiresAtMs}_${randomBytes}`;

    return `${PositionUpdater.#COOKIE_NAME}=${cookieVal}`;
  }

  private clientHeaders(): Headers {
    return {
      referer: `${PositionUpdater.#API_BASE}/`,
      cookie: this.#cookie,
    };
  }

  private async activateCookieViaRateLimitEndpoint(): Promise<number | null> {
    try {
      const rates: RatesResponse = await this.#client
        .get(PositionUpdater.#GLOBAL_RATES_ENDPOINT)
        .json();

      this.#returnedRateLimitMs = rates.refresh;
      return rates.refresh;
    } catch (err) {
      console.error(err);

      return null;
    }
  }

  private async getBinaryFlightData(): Promise<ArrayBuffer | null> {
    let res: Response<Buffer>;
    try {
      res = await this.#client.get(PositionUpdater.#POSITIONS_BIN_ENDPOINT, {
        responseType: "buffer",
      });
    } catch (err) {
      console.error(err);

      return null;
    }

    const { body } = res;
    const arrayBuffer = body.buffer.slice(
      body.byteOffset,
      body.byteOffset + body.byteLength
    );

    return arrayBuffer;
  }

  private async updateFlightData(): Promise<void> {
    const data = await this.getBinaryFlightData();
    if (!data) {
      console.error("Failed to get binary data. Getting new cookie");

      await this.resetAndActivateClientCookie();
      return;
    }

    this.#airplanes = bufferToLocations(data);
    this.#emitter.emit(this.#UPDATE_EVENT, this.#airplanes);
  }
}

type RatesResponse = {
  simload: number;
  refresh: number; // ms refresh rate
};

type AircraftUpdateHandler = (aircraft: Aircraft[]) => void;
