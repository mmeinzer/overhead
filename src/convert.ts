import { Coordinate } from "./coordinate";

type Aircraft = {
  location: Coordinate;
  registration: string | null; // r
  flight: string | null;
  type: string | null; // t
};

export function bufferToLocations(buffer: ArrayBuffer): Aircraft[] {
  let vals = new Uint32Array(buffer, 0, 8);

  const time = vals[0];
  const timeAlt = vals[1];
  const stride = vals[2];

  if (!time || !timeAlt || !stride) {
    throw new Error("Value is undefined");
  }

  if (!stride) {
    throw new Error("Missing stride");
  }

  const aircrafts = [];
  for (let off = stride; off < buffer.byteLength; off += stride) {
    let s32 = new Int32Array(buffer, off, stride / 4);
    let u8 = new Uint8Array(buffer, off, stride);

    let aircraft: Aircraft = {
      location: {
        lat: s32[3]! / 1e6,
        long: s32[2]! / 1e6,
      },
      registration: "",
      flight: "",
      type: "",
    };

    for (let i = 92; u8[i] && i < 104; i++) {
      aircraft.registration += String.fromCharCode(u8[i]!);
    }
    if (aircraft.registration === "") {
      aircraft.registration = null;
    }

    for (let i = 78; u8[i] && i < 86; i++) {
      aircraft.flight += String.fromCharCode(u8[i]!);
    }
    if (aircraft.flight === "") {
      aircraft.flight = null;
    }

    for (let i = 88; u8[i] && i < 92; i++) {
      aircraft.type += String.fromCharCode(u8[i]!);
    }
    if (aircraft.type === "") {
      aircraft.type = null;
    }

    aircrafts.push(aircraft);
  }

  return aircrafts;
}
