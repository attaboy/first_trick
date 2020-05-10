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

export function CardsEqual(card1: Card, card2: Card): boolean {
  return card1.rank === card2.rank &&
    card1.suit === card2.suit;
}

export function CardsContain(cards: Card[], card: Card): boolean {
  return cards.some((ea) => CardsEqual(ea, card));
}

export function RemoveCard(cards: Card[], card: Card): Card[] {
  return cards.filter((ea) => !CardsEqual(ea, card));
}

export function RemoveCards(existingCards: Card[], cardsToRemove: Card[]): Card[] {
  return existingCards.filter((ea) => !CardsContain(cardsToRemove, ea));
}

export function AddCard(cards: Card[], card: Card): Card[] {
  return cards.concat([card]);
}

export function AddCards(existingCards: Card[], cardsToAdd: Card[]): Card[] {
  return existingCards.concat(cardsToAdd);
}
