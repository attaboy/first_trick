import React from "react";
import { GameOfHearts, GameOfHeartsStatus } from "../lib/games/hearts";
import { PlayerName } from "./PlayerName";
import { Seat, AllSeats } from "../lib/seat";

interface GameOverProps {
  game: GameOfHearts
  status: GameOfHeartsStatus
  onNewGame: () => void
}

export function GameOver(props: GameOverProps) {
  function summarizeResult() {
    const moonShooter = props.game.findMoonShooter();
    if (moonShooter) {
      return (
        <span>
          <PlayerName seat={moonShooter} />
          <span> shot the moon!</span>
        </span>
      );
    } else {
      return (
        <span>Summing it up…</span>
      );
    }
  }

  return (
    <div id="GameOver">
      <h2>{summarizeResult()}</h2>
      <div id="GameScores">
        {AllSeats.map((seat) => (
          <GameOverScore key={`GameOverScore-${seat}`} seat={seat} game={props.game} status={props.status} />
        ))}
      </div>
      <div>
        <button className="button" type="button" onClick={props.onNewGame}>Begin next round</button>
      </div>
    </div>
  );
}

interface GameOverScoreProps {
  seat: Seat
  game: GameOfHearts
  status: GameOfHeartsStatus
}

function GameOverScore(props: GameOverScoreProps) {
  const seat = props.seat;
  const previousScore = props.status[seat];
  const newScore = props.game[seat].score;
  const totalScore = previousScore + newScore;
  const firstGame = AllSeats.every((seat) => props.status[seat] === 0);
  return (
    <div id={`GameScore-${seat}`}>
      <PlayerName seat={seat} />
      <span>
        <span> — </span>
        {firstGame ? (
          <span>{totalScore}</span>
        ) : (
          <span>{previousScore} + {newScore} = {totalScore}</span>
        )}
      </span>
    </div>
  );
}
