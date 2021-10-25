import got from "got";

const DETAILS_API_BASE = "https://aeroapi.flightaware.com";
const FLIGHT_ENDPOINT = "/aeroapi/flights/";

type Res = {
  flights?: FullFlightInfo[];
};

type Flight = {
  origin: string;
  destination: string;
};

export async function getFlightDetails(ident: string): Promise<Flight | null> {
  const url = `${DETAILS_API_BASE}${FLIGHT_ENDPOINT}${ident}`;

  try {
    const res: Res = await got(url, {
      headers: {
        "x-apikey": process.env.FLIGHT_AWARE_API_KEY,
      },
      retry: 0,
    }).json();

    const inProgressFlights =
      res.flights?.filter(
        (flight) => flight.progress_percent > 0 && flight.progress_percent < 100
      ) ?? [];

    const first = inProgressFlights[0];
    if (!first) {
      console.warn("No in progress flights found");
      return null;
    }

    return { origin: first.origin.code, destination: first.destination.code };
  } catch (err) {
    console.error(err);
    throw new Error("Error getting flight details");
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
