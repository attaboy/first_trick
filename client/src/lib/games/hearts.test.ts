import { winnerOfTrick, CreateGameOfHearts, deal, Left, EmptyGameOfHearts } from "./hearts"
import { CompletedTrick } from "../trick"
import { Card } from "../card"
import { Seat, North, East, South, West } from "../seat"
import { Suit, Hearts, Spades, Diamonds, Clubs } from "../suit"
import { Rank, Ace, King, Queen, Jack, Two, Five, Eight, Six } from "../rank"
import { StandardDeck } from "../deck"

describe("winnerOfTrick", () => {
  it("returns the winner of a completed trick", () => {
    const winner1 = winnerOfTrick({
      lead: North,
      north: { suit: Hearts, rank: Ace },
      east: { suit: Hearts, rank: King },
      south: { suit: Hearts, rank: Queen },
      west: { suit: Hearts, rank: Jack }
    });
    expect(winner1).toBe(North);

    const winner2 = winnerOfTrick({
      lead: North,
      north: { suit: Hearts, rank: Two },
      east: { suit: Hearts, rank: Jack },
      south: { suit: Hearts, rank: Five },
      west: { suit: Hearts, rank: Eight }
    });
    expect(winner2).toBe(East);

    const winner3 = winnerOfTrick({
      lead: North,
      north: { suit: Hearts, rank: Two },
      east: { suit: Spades, rank: Jack },
      south: { suit: Diamonds, rank: Five },
      west: { suit: Clubs, rank: Eight }
    });
    expect(winner3).toBe(North);

    const winner4 = winnerOfTrick({
      lead: East,
      north: { suit: Hearts, rank: Two },
      east: { suit: Spades, rank: Jack },
      south: { suit: Diamonds, rank: Five },
      west: { suit: Clubs, rank: Eight }
    });
    expect(winner4).toBe(East);

    const winner5 = winnerOfTrick({
      lead: South,
      north: { suit: Hearts, rank: Two },
      east: { suit: Spades, rank: Jack },
      south: { suit: Diamonds, rank: Five },
      west: { suit: Clubs, rank: Eight }
    });
    expect(winner5).toBe(South);

    const winner6 = winnerOfTrick({
      lead: West,
      north: { suit: Hearts, rank: Two },
      east: { suit: Spades, rank: Jack },
      south: { suit: Diamonds, rank: Five },
      west: { suit: Clubs, rank: Eight }
    });
    expect(winner6).toBe(West);

    const winner7 = winnerOfTrick({
      lead: South,
      north: { suit: Diamonds, rank: Six },
      east: { suit: Spades, rank: Jack },
      south: { suit: Diamonds, rank: Five },
      west: { suit: Clubs, rank: Eight }
    });
    expect(winner7).toBe(North);

    const winner8 = winnerOfTrick({
      lead: East,
      north: { suit: Spades, rank: Queen },
      east: { suit: Spades, rank: Jack },
      south: { suit: Spades, rank: Five },
      west: { suit: Spades, rank: Eight }
    });
    expect(winner8).toBe(North);
  });
});

describe("deal", () => {
  it("distributes a deck of cards to update an existing game", () => {
    const game = EmptyGameOfHearts(North, Left);
    expect(game.north.hand).toHaveLength(0);
    expect(game.east.hand).toHaveLength(0);
    expect(game.south.hand).toHaveLength(0);
    expect(game.west.hand).toHaveLength(0);
    const deck = StandardDeck(true);
    const newGame = deal(game, deck);
    expect(newGame.north.hand).toHaveLength(13);
    expect(newGame.east.hand).toHaveLength(13);
    expect(newGame.south.hand).toHaveLength(13);
    expect(newGame.west.hand).toHaveLength(13);
  });
});
