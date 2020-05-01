import { Card } from "./card";
import { Seat } from "./seat";
import { CompletedTrick } from "./trick";

interface PlayerInterface {
  position: Seat
  hand: Card[]
  cardsToPass: Card[]
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

  selectCardToPass(card: Card) {
    const currentCards = this.cardsToPass;
    const newCards = currentCards.includes(card) ?
      currentCards.filter((ea) => ea !== card) :
      currentCards.concat([card]).slice(-3);
    return this.clone({
      cardsToPass: newCards
    });
  }

  takeTrick(trick: CompletedTrick) {
    return this.clone({
      tricksTaken: this.tricksTaken.concat([trick])
    });
  }

  passAndReceiveCards(toReceive: Card[]) {
    return this.clone({
      hand: this.hand.filter((ea) => !this.cardsToPass.includes(ea)).concat(toReceive),
      cardsToPass: []
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
      tricksTaken: [],
      cardsToPass: []
    });
  }
}
