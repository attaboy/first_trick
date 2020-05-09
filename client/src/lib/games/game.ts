import { Seat, North, East, South, West } from "../seat";
import { Card } from "../card";

export interface Game {
  deck: Card[];
}

export function nextPlayerAfter(seat: Seat): Seat {
  switch (seat) {
    case North:
      return East;
    case East:
      return South;
    case South:
      return West;
    case West:
      return North;
  }
}
