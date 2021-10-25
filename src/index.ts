import { bufferToLocations } from "./convert";
import { inBox } from "./coordinate";
import { getBinaryFlightData } from "./position";

async function main() {
  const arr = await getBinaryFlightData();
  if (!arr) {
    console.error("Failed to fetch data");
    return;
  }

  const locations = bufferToLocations(arr);
  const result = locations.filter((aircraftData) => {
    return inBox(
      [
        { long: -93.357824, lat: 44.934261 },
        { long: -93.345335, lat: 44.940246 },
      ],
      aircraftData.location
    );
  });
  console.log(JSON.stringify(result, null, 2));
}

main();
