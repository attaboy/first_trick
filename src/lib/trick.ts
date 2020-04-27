import { Card } from "./card";
import { Seat } from "./seat";
import { Suit } from "./suit";

interface TrickInterface {
  lead: Seat;
  north: Card | null;
  east: Card | null;
  south: Card | null;
  west: Card | null;
}

export class Trick implements TrickInterface {
  readonly lead: Seat;
  readonly north: Card | null;
  readonly east: Card | null;
  readonly south: Card | null;
  readonly west: Card | null;

  constructor(props: TrickInterface) {
    this.lead = props.lead;
    this.north = props.north;
    this.east = props.east;
    this.south = props.south;
    this.west = props.west;
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

export class CompletedTrick {
  readonly lead: Seat;
  readonly north: Card;
  readonly east: Card;
  readonly south: Card;
  readonly west: Card;
  constructor(lead: Seat, north: Card, east: Card, south: Card, west: Card, trump?: Suit) {
    this.lead = lead;
    this.north = north;
    this.east = east;
    this.south = south;
    this.west = west;
  }
}
