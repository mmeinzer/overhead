export type Coordinate = {
  lat: number;
  long: number;
};

export function inBox(
  box: [Coordinate, Coordinate],
  point: Coordinate
): boolean {
  const { lat, long } = point;
  const [cornerA, cornerB] = box;
  const { lat: latA, long: longA } = cornerA;
  const { lat: latB, long: longB } = cornerB;

  const isLatBound = lat < Math.max(latA, latB) && lat > Math.min(latA, latB);
  const isLongBound =
    long < Math.max(longA, longB) && long > Math.min(longA, longB);

  return isLatBound && isLongBound;
}
