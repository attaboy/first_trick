import React from "react";
import { Seat } from "../lib/seat";

interface Props {
  seat: Seat;
}

export function PlayerName(props: Props) {
  function nameForSeat() {
    switch(props.seat) {
      case Seat.North:
        return "North";
      case Seat.East:
        return "East";
      case Seat.West:
        return "West";
      case Seat.South:
        return "South";
    }
  }
  return (
    <span>{nameForSeat()}</span>
  );
}
