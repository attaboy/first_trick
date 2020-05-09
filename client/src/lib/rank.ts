export type Ace = 'A'
export type Two = '2'
export type Three = '3'
export type Four = '4'
export type Five = '5'
export type Six = '6'
export type Seven = '7'
export type Eight = '8'
export type Nine = '9'
export type Ten = '10'
export type Jack = 'J'
export type Queen = 'Q'
export type King = 'K'

export const Ace: Ace = 'A'
export const Two: Two = '2'
export const Three: Three = '3'
export const Four: Four = '4'
export const Five: Five = '5'
export const Six: Six = '6'
export const Seven: Seven = '7'
export const Eight: Eight = '8'
export const Nine: Nine = '9'
export const Ten: Ten = '10'
export const Jack: Jack = 'J'
export const Queen: Queen = 'Q'
export const King: King = 'K'

export type Rank = Ace | Two | Three | Four | Five | Six | Seven | Eight | Nine | Ten | Jack | Queen | King

export const Ranks: ReadonlyArray<Rank> = [
  Ace,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
]

export const EuchreRanks: ReadonlyArray<Rank> = [
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
]
