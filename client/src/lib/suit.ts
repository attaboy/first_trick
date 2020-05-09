export type Spades = "spades"
export type Hearts = "hearts"
export type Clubs = "clubs"
export type Diamonds = "diamonds"

export const Spades: Spades = "spades"
export const Hearts: Hearts = "hearts"
export const Clubs: Clubs = "clubs"
export const Diamonds: Diamonds = "diamonds"

export type Suit = Spades | Hearts | Clubs | Diamonds

export const AllSuits: ReadonlyArray<Suit> = [Spades, Hearts, Clubs, Diamonds];

export function suitSymbol(suit: Suit) {
  switch(suit) {
    case Spades:
      return "\u2660\uFE0E";
    case Hearts:
      return "\u2665\uFE0E";
    case Clubs:
      return "\u2663\uFE0E";
    case Diamonds:
      return "\u2666\uFE0E";
  }
}
