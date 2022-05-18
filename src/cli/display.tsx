import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { Aircraft } from "../flights/convert";
import { PositionUpdater } from "../flights/position";
import { Coordinate, isCoordInBox } from "../coordinate";

const vergeBox: [Coordinate, Coordinate] = [
  { long: -93.363, lat: 44.932 },
  { long: -93.333, lat: 44.939 },
];

const nNumberRegex = RegExp(
  /^N[1-9]((\d{0,4})|(\d{0,3}[A-HJ-NP-Z])|(\d{0,2}[A-HJ-NP-Z]{2}))$/
);

function Counter() {
  const [airplanes, setAirplanes] = useState<Aircraft[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());

  useEffect(() => {
    const updater = new PositionUpdater();
    updater.onUpdate((airplanes) => {
      setAirplanes(airplanes);
      setUpdatedAt(new Date());
    });
    updater.start();
  }, []);

  return (
    <>
      <Box flexDirection="column">
        {airplanes.length === 0 ? <Text color="green">Loading...</Text> : null}
        <Text>{updatedAt.toLocaleString()}</Text>
        {airplanes
          .filter(({ flight }) => {
            return flight && flight.trim() && !nNumberRegex.test(flight.trim());
          })
          .map((airplane) => {
            const { flight } = airplane;
            const inBox = isCoordInBox(vergeBox, airplane.location);
            const trimmedFlight = flight!.trim(); // exists because of filter

            return (
              <Text key={trimmedFlight} color={inBox ? "blue" : "white"}>
                {`${trimmedFlight} ${inBox ? "✈️" : ""}`}
              </Text>
            );
          })}
      </Box>
    </>
  );
}

console.clear();
render(<Counter />);
