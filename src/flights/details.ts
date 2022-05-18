import got, { Got } from "got";

type Res = {
  flights?: FullFlightInfo[];
};

type Flight = {
  origin: string;
  destination: string;
};

type CacheRecord = {
  flight: Flight | null;
  addedAt: number;
};

export class DetailsAPI {
  static readonly #API_BASE = "https://aeroapi.flightaware.com";
  static readonly #FLIGHT_ENDPOINT = "aeroapi/flights/";
  static readonly #CACHE_RECORD_TTL_MINS = 1;

  readonly #client: Got;
  readonly #cache: Map<string, CacheRecord>;

  constructor() {
    this.#client = got.extend({
      prefixUrl: DetailsAPI.#API_BASE,
      headers: {
        "x-apikey": process.env.FLIGHT_AWARE_API_KEY,
      },
      retry: 0,
    });

    this.#cache = new Map();

    setInterval(this.cacheRemoveExpired.bind(this), 1000);
  }

  async lookup(ident: string): Promise<Flight | null> {
    const cachedFlight = this.cacheGet(ident);
    if (cachedFlight !== undefined) {
      return cachedFlight;
    }

    try {
      const details = await this.getFlightDetails(ident);
      this.cacheSet(ident, details);
      return details;
    } catch (err) {
      console.error(err);
      throw new Error("Error in looking up flight details");
    }
  }

  private async getFlightDetails(ident: string): Promise<Flight | null> {
    const endpoint = `${DetailsAPI.#FLIGHT_ENDPOINT}${ident}`;

    const res: Res = await this.#client
      .get(endpoint, {
        headers: {
          "x-apikey": process.env.FLIGHT_AWARE_API_KEY,
        },
        retry: 0,
      })
      .json();

    const inProgressFlights =
      res.flights?.filter(
        (flight) => flight.progress_percent > 0 && flight.progress_percent < 100
      ) ?? [];

    const [first] = inProgressFlights;
    if (!first) {
      console.warn("No in progress flights found");
      return null;
    }

    return { origin: first.origin.code, destination: first.destination.code };
  }

  // Cache methods

  /**
   * Returns undefined in the event of a cache miss. Otherwise null or Flight depending
   * on what the API returned.
   */
  private cacheGet(ident: string): Flight | null | undefined {
    const cacheRecord = this.#cache.get(ident);
    if (cacheRecord === undefined) {
      console.log(`${ident} cache miss`);
      return undefined;
    }

    if (this.expired(cacheRecord.addedAt)) {
      console.log(`${ident} cache hit but expired`);
      return undefined;
    }

    console.log(`${ident} cache hit`);
    return cacheRecord.flight;
  }

  private cacheSet(ident: string, flight: Flight | null): void {
    this.#cache.set(ident, { flight, addedAt: Date.now() });
    console.log(`${ident} stored in cache`);
  }

  private cacheRemoveExpired(): void {
    for (let [k, v] of this.#cache.entries()) {
      if (this.expired(v.addedAt)) {
        this.#cache.delete(k);
        console.log(`${k} removed since expired`);
      }
    }
  }

  private expired(addedAt: number): boolean {
    return Date.now() - addedAt > DetailsAPI.#CACHE_RECORD_TTL_MINS * 60 * 1000;
  }
}

interface FullFlightInfo {
  ident: string;
  fa_flight_id: string;
  operator: string;
  operator_iata: string;
  flight_number: string;
  registration: string;
  atc_ident: null;
  inbound_fa_flight_id: null;
  codeshares: string[];
  blocked: boolean;
  diverted: boolean;
  cancelled: boolean;
  position_only: boolean;
  origin: Airport;
  destination: Airport;
  departure_delay: number;
  arrival_delay: number;
  filed_ete: number;
  scheduled_out: Date;
  estimated_out: Date;
  actual_out: Date;
  scheduled_off: Date;
  estimated_off: Date;
  actual_off: Date;
  scheduled_on: Date;
  estimated_on: Date;
  actual_on: Date;
  scheduled_in: Date;
  estimated_in: Date;
  actual_in: Date;
  progress_percent: number;
  status: string;
  aircraft_type: string;
  route_distance: number;
  filed_airspeed: number;
  filed_altitude: number;
  route: string;
  baggage_claim: null;
  seats_cabin_business: number;
  seats_cabin_coach: number;
  seats_cabin_first: null;
  gate_origin: string;
  gate_destination: string;
  terminal_origin: null;
  terminal_destination: string;
  type: string;
}

interface Airport {
  code: string;
  airport_info_url: string;
}
