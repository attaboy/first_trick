import { winnerOfTrick } from "./hearts"
import { CompletedTrick } from "../trick"
import { Card } from "../card"
import { Seat } from "./game"
import { Suit } from "../suit"
import { Rank } from "../rank"

describe("winnerOfTrick", () => {
  it("returns the winner of a completed trick", () => {
    const winner1 = winnerOfTrick(new CompletedTrick(Seat.North,
      new Card(Suit.Hearts, Rank.Ace),
      new Card(Suit.Hearts, Rank.King),
      new Card(Suit.Hearts, Rank.Queen),
      new Card(Suit.Hearts, Rank.Jack)
    ));
    expect(winner1).toBe(Seat.North);

    const winner2 = winnerOfTrick(new CompletedTrick(Seat.North,
      new Card(Suit.Hearts, Rank.Two),
      new Card(Suit.Hearts, Rank.Jack),
      new Card(Suit.Hearts, Rank.Five),
      new Card(Suit.Hearts, Rank.Eight)
    ));
    expect(winner2).toBe(Seat.East);

    const winner3 = winnerOfTrick(new CompletedTrick(Seat.North,
      new Card(Suit.Hearts, Rank.Two),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Diamonds, Rank.Five),
      new Card(Suit.Clubs, Rank.Eight)
    ));
    expect(winner3).toBe(Seat.North);

    const winner4 = winnerOfTrick(new CompletedTrick(Seat.East,
      new Card(Suit.Hearts, Rank.Two),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Diamonds, Rank.Five),
      new Card(Suit.Clubs, Rank.Eight)
    ));
    expect(winner4).toBe(Seat.East);

    const winner5 = winnerOfTrick(new CompletedTrick(Seat.South,
      new Card(Suit.Hearts, Rank.Two),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Diamonds, Rank.Five),
      new Card(Suit.Clubs, Rank.Eight)
    ));
    expect(winner5).toBe(Seat.South);

    const winner6 = winnerOfTrick(new CompletedTrick(Seat.West,
      new Card(Suit.Hearts, Rank.Two),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Diamonds, Rank.Five),
      new Card(Suit.Clubs, Rank.Eight)
    ));
    expect(winner6).toBe(Seat.West);

    const winner7 = winnerOfTrick(new CompletedTrick(Seat.South,
      new Card(Suit.Diamonds, Rank.Six),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Diamonds, Rank.Five),
      new Card(Suit.Clubs, Rank.Eight)
    ));
    expect(winner7).toBe(Seat.North);

    const winner8 = winnerOfTrick(new CompletedTrick(Seat.East,
      new Card(Suit.Spades, Rank.Queen),
      new Card(Suit.Spades, Rank.Jack),
      new Card(Suit.Spades, Rank.Five),
      new Card(Suit.Spades, Rank.Eight)
    ));
    expect(winner8).toBe(Seat.North);
  });
});
