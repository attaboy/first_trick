import { Card } from "./card";
import { AllSuits } from "./suit";
import { Ranks, EuchreRanks } from "./rank";

export function shuffleCards(cards: Card[]): Card[] {
  const oldDeck = cards.slice();
  const newDeck: Card[] = [];
  while (oldDeck.length > 0) {
    const cardIndex = Math.floor(Math.random() * oldDeck.length);
    const card = oldDeck.splice(cardIndex, 1)[0];
    newDeck.push(card);
  }
  return newDeck;
}

export function StandardDeck(shuffle: boolean): Card[] {
  const cards: Card[] = [];
  AllSuits.forEach((suit) => {
    Ranks.forEach((rank) => {
      cards.push({ suit, rank });
    });
  });
  if (shuffle) {
    return shuffleCards(cards);
  } else {
    return cards;
  }
}

export function EuchreDeck(shuffle: boolean): Card[] {
  const cards: Card[] = [];
  AllSuits.forEach((suit) => {
    EuchreRanks.forEach((rank) => {
      cards.push({ suit, rank });
    });
  });
  if (shuffle) {
    return shuffleCards(cards);
  } else {
    return cards;
  }
}
