import { Suit } from "./suit";
import { Rank } from "./rank";

export interface Card {
  readonly suit: Suit
  readonly rank: Rank
}

export function CardIs(card: Card, suit?: Suit, rank?: Rank): boolean {
  const isSuit = !suit || card.suit === suit;
  const isRank = !rank || card.rank === rank;
  return isSuit && isRank;
}
