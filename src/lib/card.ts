import { Suit } from "./suit";
import { Rank } from "./rank";

export class Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly id: string;
  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
    this.id = `${rank}-${suit}`;
  }
}
