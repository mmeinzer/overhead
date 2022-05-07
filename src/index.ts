import { Aircraft } from "./convert";
import { isCoordInBox } from "./coordinate";
import { DetailsAPI } from "./details";
import { PositionUpdater } from "./position";
import { createServer } from "./server";

async function main() {
  const updater = new PositionUpdater();
  const detailsAPI = new DetailsAPI();
  const startServer = createServer();

  updater.onUpdate(logFirstFoundInBox);

  async function logFirstFoundInBox(locations: Aircraft[]): Promise<void> {
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
      console.log("No flights in box. Skipping details lookup.");
      return;
    }

    const info = await detailsAPI.lookup(result.flight);
    console.log(info);
  }

  await startServer();
  await updater.start();
}

main();
