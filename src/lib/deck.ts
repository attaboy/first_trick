import { Card } from "./card";
import { AllSuits } from "./suit";
import { Ranks, EuchreRanks } from "./rank";

interface DeckOfCards {
  cards: Card[];
  shuffle(): void;
}

export abstract class Deck implements DeckOfCards {
  abstract cards: Card[];

  shuffle(): void {
    const oldDeck = this.cards.slice();
    this.cards = [];
    while (oldDeck.length > 0) {
      const cardIndex = Math.floor(Math.random() * oldDeck.length);
      const card = oldDeck.splice(cardIndex, 1)[0];
      this.cards.push(card);
    }
  }
}

export class StandardDeck extends Deck {
  readonly cards: Card[];

  constructor(shuffle: boolean) {
    super();
    this.cards = [];
    AllSuits.forEach((suit) => {
      Ranks.forEach((rank) => {
        this.cards.push(new Card(suit, rank));
      });
    });
    if (shuffle) {
      this.shuffle();
    }
  }
}

export class EuchreDeck extends Deck {
  readonly cards: Card[];

  constructor(shuffle: boolean) {
    super();
    this.cards = [];
    AllSuits.forEach((suit) => {
      EuchreRanks.forEach((rank) => {
        this.cards.push(new Card(suit, rank));
      });
    });
    if (shuffle) {
      this.shuffle();
    }
  }
}
