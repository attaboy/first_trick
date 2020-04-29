import { Card } from "./card";
import { Seat } from "./seat";
import { CompletedTrick } from "./trick";

interface PlayerInterface {
  position: Seat
  hand: Card[]
  score: number
  tricksTaken: CompletedTrick[]
}

export interface Player extends Readonly<PlayerInterface> {}

export class Player {
  constructor(props: PlayerInterface) {
    Object.assign(this, props);
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
