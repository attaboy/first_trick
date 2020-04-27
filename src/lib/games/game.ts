import { Deck } from "../deck";
import { Seat } from "../seat";

export interface Game {
  deck: Deck;
}

export function nextPlayerAfter(seat: Seat): Seat {
  switch (seat) {
    case Seat.North:
      return Seat.East;
    case Seat.East:
      return Seat.South;
    case Seat.South:
      return Seat.West;
    case Seat.West:
      return Seat.North;
  }
}
