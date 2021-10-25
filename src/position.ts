import got, { Response } from "got";

const API_BASE = "https://globe.adsbexchange.com";
const GLOBE_RATES_URL = `${API_BASE}/globeRates.json`;
const BIN_URL = `${API_BASE}/data/globe_6352.binCraft`;

export async function getBinaryFlightData(): Promise<ArrayBuffer | null> {
  // TODO: Be smart about connections and cookies
  // We don't want a new cookie for every request
  const cookie = generateCookie();
  try {
    await getRates(cookie);
  } catch (err) {
    console.error("Failed to get rates!");
    return null;
  }

  let res: Response<Buffer>;
  try {
    res = await got(BIN_URL, {
      headers: {
        referer: `${API_BASE}/`,
        cookie,
      },
      retry: 0,
      responseType: "buffer",
    });
  } catch (err) {
    console.log(err);
    return null;
  }

  const { body } = res;
  const arrayBuffer = body.buffer.slice(
    body.byteOffset,
    body.byteOffset + body.byteLength
  );

  return arrayBuffer;
}

const COOKIE_NAME = "adsbx_sid";

function generateCookie(): string {
  const ts = new Date().getTime();
  const cookieVal =
    ts + 2 * 86400 * 1000 + "_" + Math.random().toString(36).substring(2, 15);
  return `${COOKIE_NAME}=${cookieVal}`;
}

function getRates(cookie: string): Promise<RatesResponse> {
  return got(GLOBE_RATES_URL, {
    headers: {
      referer: `${API_BASE}/`,
      cookie,
    },
    retry: 0,
  }).json();
}

type RatesResponse = {
  simload: number;
  refresh: number; // ms refresh rate
};
