import { Card } from "./card";
import { Seat } from "./seat";
import { Trick, CompletedTrick } from "./trick";

interface PlayerInterface {
  position: Seat
  hand: Card[]
  score: number
  tricksTaken: CompletedTrick[]
}

export class Player implements PlayerInterface {
  readonly position: Seat;
  readonly hand: Card[];
  readonly score: number;
  readonly tricksTaken: CompletedTrick[]
  constructor(props: PlayerInterface) {
    this.position = props.position;
    this.hand = props.hand;
    this.score = props.score;
    this.tricksTaken = props.tricksTaken;
  }

  dealCard(card: Card) {
    return this.clone({
      hand: this.hand.concat([card])
    });
  }

  playCard(card: Card) {
    return this.clone({
      hand: this.hand.filter((ea) => ea !== card)
    });
  }

  takeTrick(trick: CompletedTrick) {
    return this.clone({
      tricksTaken: this.tricksTaken.concat([trick])
    });
  }

  clone(props: Partial<PlayerInterface>): Player {
    return new Player(Object.assign({}, this, props));
  }

  static create(position: Seat): Player {
    return new Player({
      position,
      hand: [],
      score: 0,
      tricksTaken: []
    });
  }
}
