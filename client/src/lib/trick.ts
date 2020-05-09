import { Card, CardIs } from "./card";
import { Seat, AllSeats } from "./seat";
import { Hearts } from "./suit";

export interface TrickJson {
  lead: Seat;
  north: Card | null;
  east: Card | null;
  south: Card | null;
  west: Card | null;
}

export interface CompletedTrickJson {
  lead: Seat;
  north: Card;
  east: Card;
  south: Card;
  west: Card;
}

export interface Trick extends Readonly<TrickJson> {}

export function playCardForTrick(trick: Trick, seat: Seat, card: Card): Trick {
  const newProps: Partial<TrickJson> = {};
  newProps[seat] = card;
  return Object.assign({}, trick, newProps);
}

export function completedTrickFrom(trick: Trick): CompletedTrick | null {
  if (trick.north && trick.east && trick.south && trick.west) {
    return {
      lead: trick.lead,
      north: trick.north,
      east: trick.east,
      south: trick.south,
      west: trick.west,
    };
  } else {
    return null;
  }
}

export function CreateTrick(lead: Seat): Trick {
  return {
    lead: lead,
    north: null,
    east: null,
    south: null,
    west: null
  };
}

export function completedTrickContains(trick: CompletedTrick, card: Card): boolean {
  return AllSeats.some((seat) => {
    const seatCard = trick[seat];
    return seatCard && CardIs(seatCard, card.suit, card.rank);
  });
}

export function countHearts(trick: CompletedTrick): number {
  return AllSeats.filter((seat) => {
    const seatCard = trick[seat];
    return CardIs(seatCard, Hearts);
  }).length;
}

export interface CompletedTrick extends CompletedTrickJson {}
