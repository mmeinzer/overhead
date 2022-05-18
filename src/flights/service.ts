import { DetailsAPI } from "./details";
import { PositionUpdater } from "./position";
import { Aircraft } from "./convert";
import { isCoordInBox } from "../coordinate";

export class FlightService {
  readonly #positionUpdater: PositionUpdater;
  readonly #detailsAPI: DetailsAPI;

  #currentOverheadFlight: FlightDetails | null;

  constructor() {
    this.#positionUpdater = new PositionUpdater();
    this.#detailsAPI = new DetailsAPI();

    this.#currentOverheadFlight = null;
  }

  initialize(): Promise<void> {
    this.#positionUpdater.onUpdate(this.setCurrentFlightData.bind(this));
    return this.#positionUpdater.start();
  }

  overheadFlight(): FlightDetails | null {
    return this.#currentOverheadFlight;
  }

  private async setCurrentFlightData(locations: Aircraft[]): Promise<void> {
    const result = locations.find((aircraftData) => {
      return isCoordInBox(
        [
          { long: -93.357824, lat: 44.934261 },
          { long: -93.345335, lat: 44.940246 },
        ],
        aircraftData.location
      );
    });

    if (!result?.flight) {
      this.#currentOverheadFlight = null;
      return;
    }

    const info = await this.#detailsAPI.lookup(result.flight);
    if (!info) {
      this.#currentOverheadFlight = null;
      return;
    }

    this.#currentOverheadFlight = {
      from: info.origin,
      to: info.destination,
    };
  }
}

type FlightDetails = {
  from: string;
  to: string;
};
