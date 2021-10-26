import { Aircraft } from "./convert";
import { isCoordInBox } from "./coordinate";
import { getFlightDetails } from "./details";
import { PositionUpdater } from "./position";

async function main() {
  const updater = new PositionUpdater();
  updater.onUpdate(logIfAnyInBox);

  await updater.start();
}

async function logIfAnyInBox(locations: Aircraft[]): Promise<void> {
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
    console.log("No flights in area. Skipping details lookup.");
    return;
  }

  const info = await getFlightDetails(result.flight);

  console.log(info);
}

main();
