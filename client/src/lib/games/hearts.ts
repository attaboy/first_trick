import { StandardDeck } from "../deck";
import { nextPlayerAfter, FourPlayers } from "./game";
import { dealCardFor, playCardFor, selectCardToPassFor, takeTrickFor, passAndReceiveCardsFor, addScoreFor, CreatePlayer } from "../player";
import { Trick, CompletedTrick, completedTrickContains, countHearts, playCardForTrick, completedTrickFrom, CreateTrick } from "../trick";
import { Rank, Ranks, Two, Queen, Ace, King, Jack, Ten, Nine, Eight, Seven, Six, Five, Four, Three } from "../rank";
import { Seat, AllSeats, North, East, South, West } from "../seat";
import { Card, CardIs, CardsContain } from "../card";
import { Hearts, Clubs, Spades } from "../suit";

export interface GameOfHeartsStatus {
  north: number
  east: number
  south: number
  west: number
  handsPlayed: number
}

export type Left = "left"
export type Right = "right"
export type Across = "across"
export type None = "none"

export const Left: Left = "left"
export const Right: Right = "right"
export const Across: Across = "across"
export const None: None = "none"

export type PassMode = Left | Right | Across | None

export interface GameOfHeartsJson extends FourPlayers {
  passMode: PassMode
  passingModeActive: boolean
  currentDealer: Seat
  currentTrick: Trick | null
  currentPlayer: Seat
  heartsBroken: boolean
  gameOver: boolean
}

export type GameOfHeartsUpdate = Partial<GameOfHeartsJson>

interface GameOfHeartsInterface extends GameOfHeartsJson {}

export interface GameOfHearts extends Readonly<GameOfHeartsInterface> {}

export function deal(game: GameOfHearts, deck: Card[]): GameOfHearts {
  let recipient = nextPlayerAfter(game.currentDealer);
  let nextCard = deck.pop();
  const newGame = Object.assign({}, game);
  while (nextCard) {
    let newGameUpdate: Partial<GameOfHeartsInterface> = {};
    newGameUpdate[recipient] = dealCardFor(newGame[recipient], nextCard);
    Object.assign(newGame, newGameUpdate);
    recipient = nextPlayerAfter(recipient);
    nextCard = deck.pop();
  }
  return newGame;
}

export function turnActiveFor(game: GameOfHearts, seat: Seat): boolean {
  return Boolean(game.passingModeActive ||
    (seat === game.currentPlayer && game.currentTrick && !completedTrickFrom(game.currentTrick)));
}

export function playCard(game: GameOfHearts, playingSeat: Seat, card: Card, trick: Trick): GameOfHeartsUpdate {
  const player = game[playingSeat];
  const currentTrick = playCardForTrick(trick, playingSeat, card);
  const completedTrick = completedTrickFrom(currentTrick);
  const nextPlayer = completedTrick ? winnerOfTrick(completedTrick) : nextPlayerAfter(game.currentPlayer);
  const update: GameOfHeartsUpdate = {
    currentTrick: currentTrick,
    currentPlayer: nextPlayer
  };
  update[playingSeat] = playCardFor(player, card);
  if (!game.heartsBroken && CardIs(card, Hearts)) {
    update.heartsBroken = true;
  }
  return update;
}

export function selectCardToPass(game: GameOfHearts, playingSeat: Seat, card: Card): GameOfHeartsUpdate {
  const player = game[playingSeat];
  const update: GameOfHeartsUpdate = {};
  update[playingSeat] = selectCardToPassFor(player, card);
  return update;
}

export function readyToPass(game: GameOfHearts): boolean {
  return game.passingModeActive && AllSeats.every((seat) => game[seat].cardsToPass.length === 3);
}

export function passCards(game: GameOfHearts): GameOfHeartsUpdate {
  const northSends = game.north.cardsToPass;
  const eastSends = game.east.cardsToPass;
  const westSends = game.west.cardsToPass;
  const southSends = game.south.cardsToPass;

  let northReceives: Card[] = [];
  let eastReceives: Card[] = [];
  let southReceives: Card[] = [];
  let westReceives: Card[] = [];

  if (game.passMode === Left) {
    northReceives = westSends;
    eastReceives = northSends;
    southReceives = eastSends;
    westReceives = southSends;
  } else if (game.passMode === Right) {
    northReceives = eastSends;
    eastReceives = southSends;
    southReceives = westSends;
    westReceives = northSends;
  } else if (game.passMode === Across) {
    northReceives = southSends;
    eastReceives = westSends;
    southReceives = northSends;
    westReceives = eastSends;
  }
  const update = {
    north: passAndReceiveCardsFor(game.north, northReceives),
    east: passAndReceiveCardsFor(game.east, eastReceives),
    south: passAndReceiveCardsFor(game.south, southReceives),
    west: passAndReceiveCardsFor(game.west, westReceives),
  };
  return startFirstTrick(game, update);
}

export function startFirstTrick(game: GameOfHearts, playersUpdate: FourPlayers): GameOfHeartsUpdate {
  const firstPlayer = AllSeats.find((seat) => CardsContain(playersUpdate[seat].hand, { suit: Clubs, rank: Two }));
  if (firstPlayer) {
    return Object.assign({}, game, playersUpdate, {
      passingModeActive: false,
      currentPlayer: firstPlayer,
      currentTrick: CreateTrick(firstPlayer)
    });
  } else {
    throw new Error("What did you do with the two of clubs?");
  }
}

export function hasTricksLeft(game: GameOfHearts): boolean {
  return game[game.currentPlayer].hand.length > 0;
}

export function justStarted(game: GameOfHearts): boolean {
  return AllSeats.every((seat) => game[seat].tricksTaken.length === 0);
}

export function nextTrick(game: GameOfHearts, completedTrick: CompletedTrick): GameOfHeartsUpdate {
  const trickWinner = game[game.currentPlayer];
  const updatedPlayer = takeTrickFor(trickWinner, completedTrick);
  const update: Partial<GameOfHeartsInterface> = {};
  update[game.currentPlayer] = updatedPlayer;
  if (hasTricksLeft(game)) {
    update.currentTrick = CreateTrick(game.currentPlayer);
    return update;
  } else {
    return endGame(Object.assign({}, game, update));
  }
}

export function endGame(game: GameOfHearts): GameOfHeartsUpdate {
  const moonShooter = findMoonShooter(game);
  const update: Partial<GameOfHeartsInterface> = {
    gameOver: true
  };
  if (moonShooter) {
    AllSeats.filter((ea) => ea !== moonShooter).forEach((seat) => {
      const player = game[seat];
      update[seat] = addScoreFor(player, 26);
    });
  } else {
    AllSeats.forEach((seat) => {
      const player = game[seat];
      const numHearts = player.tricksTaken.reduce((sum, trick) => sum + countHearts(trick), 0);
      const hasQueenOfSpades = player.tricksTaken.some((trick) => completedTrickContains(trick, { suit: Spades, rank: Queen }));
      update[seat] = addScoreFor(player, numHearts + (hasQueenOfSpades ? 13 : 0));
    });
  }
  return update;
}

export function findMoonShooter(game: GameOfHearts): Seat | undefined {
  return AllSeats.find((seat) => {
    return shotTheMoon(game[seat].tricksTaken);
  });
}

export function validCard(game: GameOfHearts, card: Card, hand: Card[], trick: Trick | null): boolean {
    return !trick || validCardForTrick(game, card, hand, trick);
  }

export function validCardForTrick(game: GameOfHearts, card: Card, hand: Card[], trick: Trick): boolean {
  const leadCard = trick[trick.lead];
  if (!leadCard && justStarted(game)) {
    return CardIs(card, Clubs, Two);
  } else if (!leadCard) {
    return game.heartsBroken ||
      !CardIs(card, Hearts) ||
      hand.every((ea) => CardIs(ea, Hearts));
  } else if (hand.some((ea) => CardIs(ea, leadCard.suit))) {
    return CardIs(card, leadCard.suit);
  } else if (justStarted(game)) {
    return !CardIs(card, Hearts) && !CardIs(card, Spades, Queen);
  } else {
    return true;
  }
}

export function EmptyGameOfHearts(newDealer: Seat, newPassMode?: PassMode) {
  return {
    north: CreatePlayer(North),
    east: CreatePlayer(East),
    south: CreatePlayer(South),
    west: CreatePlayer(West),
    currentDealer: newDealer,
    heartsBroken: false,
    passMode: newPassMode || Left,
    passingModeActive: true,
    currentTrick: null,
    currentPlayer: newDealer,
    gameOver: false
  };
}

export function CreateGameOfHearts(newDealer: Seat, newPassMode?: PassMode): GameOfHearts {
  const deck = StandardDeck(true);
  return deal(EmptyGameOfHearts(newDealer, newPassMode), deck);
}

export function winnerOfTrick(trick: CompletedTrick): Seat {
  const leadingCard = trick[trick.lead];
  const leadingSuit = leadingCard.suit;
  let winner = trick.lead;
  let highCard = leadingCard;

  function compare(player: Seat) {
    const card = trick[player];
    const followedSuit = CardIs(card, leadingSuit);
    if (followedSuit && numericRankFor(card.rank) > numericRankFor(highCard.rank)) {
      winner = player;
      highCard = card;
    }
  }

  let nextPlayer = nextPlayerAfter(trick.lead);
  do {
    compare(nextPlayer);
    nextPlayer = nextPlayerAfter(nextPlayer);
  } while (nextPlayer !== trick.lead);

  return winner;
}

export function shotTheMoon(tricks: CompletedTrick[]): boolean {
  const allHearts = Ranks.every((rank) => {
    return tricks.some((trick) => {
      return completedTrickContains(trick, { suit: Hearts, rank: rank })
    });
  });
  const queenOfSpades = tricks.some((trick) => {
    return completedTrickContains(trick, { suit: Spades, rank: Queen });
  });
  return allHearts && queenOfSpades;
}

function numericRankFor(rank: Rank): number {
  switch (rank) {
    case Ace:
      return 14;
    case King:
      return 13;
    case Queen:
      return 12;
    case Jack:
      return 11;
    case Ten:
      return 10;
    case Nine:
      return 9;
    case Eight:
      return 8;
    case Seven:
      return 7;
    case Six:
      return 6;
    case Five:
      return 5;
    case Four:
      return 4;
    case Three:
      return 3;
    case Two:
    default:
      return 2;
  }
}

export function nextPassModeAfter(prevPassMode: PassMode): PassMode {
  switch (prevPassMode) {
    case Left:
      return Right;
    case Right:
      return Across;
    case Across:
      return None;
    case None:
    default:
      return Left;
  }
}

interface GroupedHand {
  spades: Card[]
  hearts: Card[]
  clubs: Card[]
  diamonds: Card[]
}

export function sortHand(hand: Card[]): Card[] {
  const grouped: GroupedHand = {
    spades: [],
    hearts: [],
    clubs: [],
    diamonds: []
  };
  hand.forEach((card) => {
    grouped[card.suit].push(card);
  });
  return (Object.keys(grouped) as Array<keyof GroupedHand>).reduce<Card[]>((hand, suit) => {
    const sortedSuit = grouped[suit].sort((a, b) => numericRankFor(b.rank) - numericRankFor(a.rank));
    return hand.concat(sortedSuit);
  }, []);
}
