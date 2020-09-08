import React from "react";
import { Seat, nameForSeat } from "../lib/seat";

interface Props {
  seat: Seat;
  name: string | undefined;
}

export function PlayerName(props: Props) {
  return (
    <span>{props.name || nameForSeat(props.seat)}</span>
  );
}
