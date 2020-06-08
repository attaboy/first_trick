import { Seat, North, East, South, West } from "../seat";
import { Player, PlayerIdentity } from "../player";

export interface NeedsFourPlayers {
  north: PlayerIdentity | null
  east: PlayerIdentity | null
  south: PlayerIdentity | null
  west: PlayerIdentity | null
}

export interface FourPlayers {
  north: Player
  east: Player
  south: Player
  west: Player
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
