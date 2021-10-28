import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { Aircraft } from "../convert";
import { PositionUpdater } from "../position";
import { Coordinate, isCoordInBox } from "../coordinate";

const vergeBox: [Coordinate, Coordinate] = [
  { long: -93.363, lat: 44.932 },
  { long: -93.333, lat: 44.939 },
];

function Counter() {
  const [airplanes, setAirplanes] = useState<Aircraft[]>([]);

  useEffect(() => {
    const updater = new PositionUpdater();
    updater.onUpdate((airplanes) => setAirplanes(airplanes));
    updater.start();
  }, []);

  return (
    <>
      <Box flexDirection="column">
        {airplanes.length === 0 ? <Text color="green">Loading...</Text> : null}
        {airplanes
          .filter(({ flight, registration }) => flight || registration)
          .map((airplane) => (
            <Text
              key={airplane.flight ?? airplane.registration}
              color={
                isCoordInBox(vergeBox, airplane.location) ? "blue" : "white"
              }
            >
              {airplane.flight}
            </Text>
          ))}
      </Box>
    </>
  );
}

console.clear();
render(<Counter />);
