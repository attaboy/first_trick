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

export enum PassMode {
  Left = "left",
  Right = "right",
  Across = "across",
  None = "none"
}

interface GameOfHeartsInterface {
  north: Player;
  east: Player;
  south: Player;
  west: Player;
  passMode: PassMode;
  passingModeActive: boolean;
  currentDealer: Seat;
  currentTrick: Trick | null;
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
    return Boolean(this.passingModeActive ||
      (seat === this.currentPlayer && this.currentTrick && !this.currentTrick.completedTrick()));
  }

  playCard(playingSeat: Seat, card: Card, trick: Trick): GameOfHearts {
    const player = this[playingSeat];
    const currentTrick = trick.playCard(playingSeat, card);
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

  selectCardToPass(playingSeat: Seat, card: Card): GameOfHearts {
    const player = this[playingSeat];
    const update: Partial<GameOfHeartsInterface> = {};
    update[playingSeat] = player.selectCardToPass(card);
    return this.clone(update);
  }

  readyToPass(): boolean {
    return this.passingModeActive && AllSeats.every((seat) => this[seat].cardsToPass.length === 3);
  }

  passCards(): GameOfHearts {
    const northSends = this.north.cardsToPass;
    const eastSends = this.east.cardsToPass;
    const westSends = this.west.cardsToPass;
    const southSends = this.south.cardsToPass;

    let northReceives: Card[] = [];
    let eastReceives: Card[] = [];
    let southReceives: Card[] = [];
    let westReceives: Card[] = [];

    if (this.passMode === PassMode.Left) {
      northReceives = westSends;
      eastReceives = northSends;
      southReceives = eastSends;
      westReceives = southSends;
    } else if (this.passMode === PassMode.Right) {
      northReceives = eastSends;
      eastReceives = southSends;
      southReceives = westSends;
      westReceives = northSends;
    } else if (this.passMode === PassMode.Across) {
      northReceives = southSends;
      eastReceives = westSends;
      southReceives = northSends;
      westReceives = eastSends;
    }
    return this.clone({
      north: this.north.passAndReceiveCards(northReceives),
      east: this.east.passAndReceiveCards(eastReceives),
      south: this.south.passAndReceiveCards(southReceives),
      west: this.west.passAndReceiveCards(westReceives),
    }).startFirstTrick()
  }

  startFirstTrick(): GameOfHearts {
    const firstPlayer = AllSeats.find((seat) => this[seat].hand.some((card) => card.is(Suit.Clubs, Rank.Two)));
    if (firstPlayer) {
      return this.clone({
        passingModeActive: false,
        currentPlayer: firstPlayer,
        currentTrick: Trick.create(firstPlayer)
      });
    } else {
      throw new Error("What did you do with the two of clubs?");
    }
  }

  hasTricksLeft(): boolean {
    return this[this.currentPlayer].hand.length > 0;
  }

  justStarted(): boolean {
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

  validCard(card: Card, hand: Card[], trick: Trick | null): boolean {
    return !trick || this.validCardForTrick(card, hand, trick);
  }

  validCardForTrick(card: Card, hand: Card[], trick: Trick): boolean {
    const leadCard = trick[trick.lead];
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

  static create(newDealer: Seat, newPassMode?: PassMode): GameOfHearts {
    const deck = new StandardDeck(true);
    return new GameOfHearts({
      north: Player.create(Seat.North),
      east: Player.create(Seat.East),
      south: Player.create(Seat.South),
      west: Player.create(Seat.West),
      currentDealer: newDealer,
      heartsBroken: false,
      passMode: newPassMode || PassMode.Left,
      passingModeActive: true,
      currentTrick: null,
      currentPlayer: newDealer,
      gameOver: false
    }).deal(deck);
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
    default:
      return 2;
  }
}

export function nextPassModeAfter(prevPassMode: PassMode): PassMode {
  switch (prevPassMode) {
    case PassMode.Left:
      return PassMode.Right;
    case PassMode.Right:
      return PassMode.Across;
    case PassMode.Across:
      return PassMode.None;
    case PassMode.None:
    default:
      return PassMode.Left;
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
