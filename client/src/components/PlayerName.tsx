import React from "react";
import { Seat, North, East, West, South } from "../lib/seat";

interface Props {
  seat: Seat;
}

export function PlayerName(props: Props) {
  function nameForSeat() {
    switch(props.seat) {
      case North:
        return "North";
      case East:
        return "East";
      case West:
        return "West";
      case South:
        return "South";
    }
  }
  return (
    <span>{nameForSeat()}</span>
  );
}
