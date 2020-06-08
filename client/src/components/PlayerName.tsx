import React from "react";
import { Seat, nameForSeat } from "../lib/seat";

interface Props {
  seat: Seat;
}

export function PlayerName(props: Props) {
  return (
    <span>{nameForSeat(props.seat)}</span>
  );
}
