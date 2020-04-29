import { Card } from "./card";
import { Seat, AllSeats } from "./seat";
import { Suit } from "./suit";

interface TrickInterface {
  lead: Seat;
  north: Card | null;
  east: Card | null;
  south: Card | null;
  west: Card | null;
}

export interface Trick extends Readonly<TrickInterface> {}

export class Trick {
  constructor(props: TrickInterface) {
    Object.assign(this, props);
  }

  clone(props: Partial<TrickInterface>): Trick {
    return new Trick(Object.assign({}, this, props));
  }

  playCard(seat: Seat, card: Card): Trick {
    const newProps: Partial<TrickInterface> = {};
    newProps[seat] = card;
    return this.clone(newProps);
  }

  completedTrick(): CompletedTrick | null {
    if (this.north && this.east && this.south && this.west) {
      return new CompletedTrick(this.lead, this.north, this.east, this.south, this.west);
    } else {
      return null;
    }
  }

  static create(lead: Seat, trump?: Suit): Trick {
    return new Trick({
      lead: lead,
      north: null,
      east: null,
      south: null,
      west: null
    });
  }
}

export class CompletedTrick extends Trick {
  readonly lead: Seat;
  readonly north: Card;
  readonly east: Card;
  readonly south: Card;
  readonly west: Card;

  contains(card: Card): boolean {
    return AllSeats.some((seat) => {
      const seatCard = this[seat];
      return seatCard && seatCard.is(card.suit, card.rank);
    });
  }

  countHearts(): number {
    return AllSeats.filter((seat) => {
      const seatCard = this[seat];
      return seatCard.is(Suit.Hearts);
    }).length;
  }

  constructor(lead: Seat, north: Card, east: Card, south: Card, west: Card, trump?: Suit) {
    super({
      lead,
      north,
      east,
      south,
      west
    });
    this.lead = lead;
    this.north = north;
    this.east = east;
    this.south = south;
    this.west = west;
  }
}
