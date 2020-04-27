import { StandardDeck } from "../deck";
import { nextPlayerAfter } from "./game";
import { Player } from "../player";
import { Trick, CompletedTrick } from "../trick";
import { Rank } from "../rank";
import { Seat } from "../seat";
import { Card } from "../card";

export interface GameOfHeartsInterface {
  north: Player;
  east: Player;
  south: Player;
  west: Player;
  currentDealer: Seat;
  currentTrick: Trick;
  currentPlayer: Seat;
  heartsBroken: boolean;
}

export class GameOfHearts implements GameOfHeartsInterface {
  readonly north: Player;
  readonly east: Player;
  readonly south: Player;
  readonly west: Player;
  readonly currentDealer: Seat;
  readonly currentTrick: Trick;
  readonly currentPlayer: Seat;
  readonly heartsBroken: boolean;

  constructor(props: GameOfHeartsInterface) {
    this.north = props.north;
    this.east = props.east;
    this.south = props.south;
    this.west = props.west;
    this.currentDealer = props.currentDealer;
    this.currentTrick = props.currentTrick;
    this.currentPlayer = props.currentPlayer;
    this.heartsBroken = props.heartsBroken;
  }

  private deal(deck: StandardDeck): GameOfHearts {
    let recipient = nextPlayerAfter(this.currentDealer);
    let nextCard = deck.cards.pop();
    let game = this.clone({});
    while (nextCard) {
      const update: Partial<GameOfHeartsInterface> = {};
      update[recipient] = game[recipient].dealCard(nextCard);
      game = game.clone(update)
      recipient = nextPlayerAfter(recipient);
      nextCard = deck.cards.pop();
    }
    return game;
  }

  turnActiveFor(seat: Seat): boolean {
    return seat === this.currentPlayer && !this.currentTrick.completedTrick();
  }

  playCard(playingSeat: Seat, card: Card): GameOfHearts {
    const player = this[playingSeat];
    const currentTrick = this.currentTrick.playCard(playingSeat, card);
    const completedTrick = currentTrick.completedTrick();
    const nextPlayer = completedTrick ? winnerOfTrick(completedTrick) : nextPlayerAfter(this.currentPlayer);
    const update: Partial<GameOfHeartsInterface> = {
      currentTrick: currentTrick,
      currentPlayer: nextPlayer
    };
    update[playingSeat] = player.playCard(card);
    return this.clone(update);
  }

  nextTrick(completedTrick: CompletedTrick): GameOfHearts {
    const trickWinner = this[this.currentPlayer];
    const updatedPlayer = trickWinner.takeTrick(completedTrick);
    const update: Partial<GameOfHeartsInterface> = {
      currentTrick: Trick.create(this.currentPlayer)
    };
    update[this.currentPlayer] = updatedPlayer;
    return this.clone(update);
  }

  clone(newProps: Partial<GameOfHeartsInterface>): GameOfHearts {
    return new GameOfHearts(Object.assign({}, this, newProps));
  }

  static create(currentDealer: Seat): GameOfHearts {
    const deck = new StandardDeck(true);
    const firstPlayer = nextPlayerAfter(currentDealer);
    let game = new GameOfHearts({
      north: Player.create(Seat.North),
      east: Player.create(Seat.East),
      south: Player.create(Seat.South),
      west: Player.create(Seat.West),
      currentDealer: currentDealer,
      heartsBroken: false,
      currentTrick: Trick.create(firstPlayer),
      currentPlayer: firstPlayer
    });
    game = game.deal(deck);
    return game;
  }
}

export function winnerOfTrick(trick: CompletedTrick): Seat {
  const leadingCard = trick[trick.lead];
  const leadingSuit = leadingCard.suit;
  let winner = trick.lead;
  let highCard = leadingCard;

  function compare(player: Seat) {
    const card = trick[player];
    const followedSuit = card.suit === leadingSuit;
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

function numericRankFor(rank: Rank): number {
  switch (rank) {
    case Rank.Ace:
      return 14;
    case Rank.King:
      return 13;
    case Rank.Queen:
      return 12;
    case Rank.Jack:
      return 11;
    case Rank.Ten:
      return 10;
    case Rank.Nine:
      return 9;
    case Rank.Eight:
      return 8;
    case Rank.Seven:
      return 7;
    case Rank.Six:
      return 6;
    case Rank.Five:
      return 5;
    case Rank.Four:
      return 4;
    case Rank.Three:
      return 3;
    case Rank.Two:
      return 2;
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
