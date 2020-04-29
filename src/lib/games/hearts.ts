import { StandardDeck } from "../deck";
import { nextPlayerAfter } from "./game";
import { Player } from "../player";
import { Trick, CompletedTrick } from "../trick";
import { Rank, Ranks } from "../rank";
import { Seat, AllSeats } from "../seat";
import { Card } from "../card";
import { Suit } from "../suit";

export interface GameOfHeartsStatus {
  north: number
  east: number
  south: number
  west: number
  handsPlayed: number
}

interface GameOfHeartsInterface {
  north: Player;
  east: Player;
  south: Player;
  west: Player;
  currentDealer: Seat;
  currentTrick: Trick;
  currentPlayer: Seat;
  heartsBroken: boolean;
  gameOver: boolean;
}

export interface GameOfHearts extends Readonly<GameOfHeartsInterface> {}

export class GameOfHearts {
  constructor(props: GameOfHeartsInterface) {
    Object.assign(this, props);
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
    if (!this.heartsBroken && card.is(Suit.Hearts)) {
      update.heartsBroken = true;
    }
    return this.clone(update);
  }

  hasTricksLeft() {
    return this[this.currentPlayer].hand.length > 0;
  }

  justStarted() {
    return AllSeats.every((seat) => this[seat].tricksTaken.length === 0);
  }

  nextTrick(completedTrick: CompletedTrick): GameOfHearts {
    const trickWinner = this[this.currentPlayer];
    const updatedPlayer = trickWinner.takeTrick(completedTrick);
    const update: Partial<GameOfHeartsInterface> = {};
    update[this.currentPlayer] = updatedPlayer;
    if (this.hasTricksLeft()) {
      update.currentTrick = Trick.create(this.currentPlayer);
      return this.clone(update);
    } else {
      return this.clone(update).endGame();
    }
  }

  endGame(): GameOfHearts {
    const moonShooter = this.findMoonShooter();
    const update: Partial<GameOfHeartsInterface> = {
      gameOver: true
    };
    if (moonShooter) {
      AllSeats.filter((ea) => ea !== moonShooter).forEach((seat) => {
        const player = this[seat];
        update[seat] = player.clone({
          score: player.score + 26
        });
      });
    } else {
      AllSeats.forEach((seat) => {
        const player = this[seat];
        const numHearts = player.tricksTaken.reduce((sum, trick) => sum + trick.countHearts(), 0);
        const hasQueenOfSpades = player.tricksTaken.some((trick) => trick.contains(new Card(Suit.Spades, Rank.Queen)));
        update[seat] = player.clone({
          score: player.score + numHearts + (hasQueenOfSpades ? 13 : 0)
        });
      })
    }
    return this.clone(update);
  }

  findMoonShooter(): Seat | undefined {
    return AllSeats.find((seat) => {
      return shotTheMoon(this[seat].tricksTaken);
    });
  }

  validCardForTrick(card: Card, hand: Card[]): boolean {
    const leadCard = this.currentTrick[this.currentTrick.lead];
    if (!leadCard && this.justStarted()) {
      return card.is(Suit.Clubs, Rank.Two);
    } else if (!leadCard) {
      return this.heartsBroken ||
        !card.is(Suit.Hearts) ||
        hand.every((ea) => ea.is(Suit.Hearts));
    } else if (hand.some((ea) => ea.is(leadCard.suit))) {
      return card.is(leadCard.suit);
    } else if (this.justStarted()) {
      return !card.is(Suit.Hearts) && !card.is(Suit.Spades, Rank.Queen);
    } else {
      return true;
    }
  }

  clone(newProps: Partial<GameOfHeartsInterface>): GameOfHearts {
    return new GameOfHearts(Object.assign({}, this, newProps));
  }

  static create(currentDealer: Seat): GameOfHearts {
    const deck = new StandardDeck(true);
    let game = new GameOfHearts({
      north: Player.create(Seat.North),
      east: Player.create(Seat.East),
      south: Player.create(Seat.South),
      west: Player.create(Seat.West),
      currentDealer: currentDealer,
      heartsBroken: false,
      currentTrick: Trick.create(currentDealer),
      currentPlayer: currentDealer,
      gameOver: false
    });
    game = game.deal(deck);
    const firstPlayer = AllSeats.find((seat) => game[seat].hand.some((card) => card.is(Suit.Clubs, Rank.Two))) as Seat;
    return game.clone({
      currentPlayer: firstPlayer,
      currentTrick: Trick.create(firstPlayer)
    });
  }
}

export function winnerOfTrick(trick: CompletedTrick): Seat {
  const leadingCard = trick[trick.lead];
  const leadingSuit = leadingCard.suit;
  let winner = trick.lead;
  let highCard = leadingCard;

  function compare(player: Seat) {
    const card = trick[player];
    const followedSuit = card.is(leadingSuit);
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
      return trick.contains(new Card(Suit.Hearts, rank))
    });
  });
  const queenOfSpades = tricks.some((trick) => {
    return trick.contains(new Card(Suit.Spades, Rank.Queen));
  });
  return allHearts && queenOfSpades;
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
