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
          .filter(({ flight, registration }) => flight || registration)
          .map((airplane) => {
            const { flight, registration } = airplane;
            const inBox = isCoordInBox(vergeBox, airplane.location);

            return (
              <Text
                key={flight ?? registration}
                color={inBox ? "blue" : "white"}
              >
                {`${flight ?? registration} ${inBox ? "✈️" : ""}`}
              </Text>
            );
          })}
      </Box>
    </>
  );
}

console.clear();
render(<Counter />);
