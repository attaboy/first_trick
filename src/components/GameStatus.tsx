import React from "react";
import { GameOfHearts, GameOfHeartsStatus } from "../lib/games/hearts";
import { PlayerName } from "./PlayerName";
import { Seat } from "../lib/seat";

interface Props {
  game: GameOfHearts
  status: GameOfHeartsStatus
}

export function GameStatus(props: Props) {
  const completedTrick = props.game.currentTrick.completedTrick();
  const currentPlayer = props.game.currentPlayer;

  function mainHeading() {
    if (props.game.gameOver) {
      return (
        <h2>Game over!</h2>
      );
    } else if (completedTrick) {
      return (
        <h2><PlayerName seat={currentPlayer} /><span> takes the trick!</span></h2>
      );
    } else {
      return (
        <h2>
          <span>{props.game.justStarted() ? "First trick! " : ""}</span>
          <span>It’s </span><PlayerName seat={currentPlayer} /><span>’s turn.</span>
        </h2>
      );
    }
  }

  return (
    <div>
      {mainHeading()}
      <h3>
        <PlayerName seat={Seat.North} /> — {props.status.north}
        <span className="color-faded"> • </span>
        <PlayerName seat={Seat.East} /> — {props.status.east}
        <span className="color-faded"> • </span>
        <PlayerName seat={Seat.South} /> — {props.status.south}
        <span className="color-faded"> • </span>
        <PlayerName seat={Seat.West} /> — {props.status.west}
      </h3>
    </div>
  )
}
