export enum Suit {
  Spades = "spades",
  Hearts = "hearts",
  Clubs = "clubs",
  Diamonds = "diamonds",
}

export const AllSuits: ReadonlyArray<Suit> = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];

export function suitSymbol(suit: Suit) {
  switch(suit) {
    case Suit.Spades:
      return "\u2660\uFE0E";
    case Suit.Hearts:
      return "\u2665\uFE0E";
    case Suit.Clubs:
      return "\u2663\uFE0E";
    case Suit.Diamonds:
      return "\u2666\uFE0E";
  }
}
