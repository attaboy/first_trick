export type North = "north"
export type East = "east"
export type South = "south"
export type West = "west"

export const North: North = "north"
export const East: East = "east"
export const South: South = "south"
export const West: West = "west"

export type Seat = North | East | South | West

export const AllSeats: ReadonlyArray<Seat> = [North, East, South, West];

export function nameForSeat(seat: Seat) {
  switch (seat) {
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
