import { Coordinate } from "../coordinate";

export type Aircraft = {
  location: Coordinate;
  registration: string | null; // r
  flight: string | null;
  type: string | null; // t
};

export function bufferToLocations(buffer: ArrayBuffer): Aircraft[] {
  let vals = new Uint32Array(buffer, 0, 8);

  const [time, timeAlt, stride] = vals;
  if (!time || !timeAlt || !stride) {
    throw new Error("time, timeAlt, or stride is missing");
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
      aircraft.registration = aircraft.registration?.trim() || null;
    }

    for (let i = 78; u8[i] && i < 86; i++) {
      aircraft.flight += String.fromCharCode(u8[i]!);
      aircraft.flight = aircraft.flight?.trim() || null;
    }

    for (let i = 88; u8[i] && i < 92; i++) {
      aircraft.type += String.fromCharCode(u8[i]!);
      aircraft.type = aircraft.type?.trim() || null;
    }

    aircrafts.push(aircraft);
  }

  return aircrafts;
}
