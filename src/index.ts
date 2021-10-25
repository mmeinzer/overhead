import { bufferToLocations } from "./convert";
import { isCoordInBox } from "./coordinate";
import { getFlightDetails } from "./details";
import { getBinaryFlightData } from "./position";

async function main() {
  const arr = await getBinaryFlightData();
  if (!arr) {
    console.error("Failed to fetch data");
    return;
  }

  const locations = bufferToLocations(arr);
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
