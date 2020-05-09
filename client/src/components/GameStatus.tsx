import React from "react";
import { GameOfHearts, GameOfHeartsStatus, None } from "../lib/games/hearts";
import { PlayerName } from "./PlayerName";
import { North, East, South, West } from "../lib/seat";
import { completedTrickFrom } from "../lib/trick";

interface Props {
  game: GameOfHearts
  status: GameOfHeartsStatus
}

export function GameStatus(props: Props) {
  const completedTrick = props.game.currentTrick && completedTrickFrom(props.game.currentTrick);
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
    } else if (props.game.passingModeActive) {
      return (
        <h2>Choose three cards to pass {props.game.passMode}</h2>
      );
    } else {
      return (
        <h2>
          <span>{props.game.justStarted() ? "First trick! " : ""}</span>
          {props.game.passMode === None ? (
            <span> (No passing.) </span>
          ) : null}
          <span>It’s </span><PlayerName seat={currentPlayer} /><span>’s turn.</span>
        </h2>
      );
    }
  }

  return (
    <div>
      {mainHeading()}
      <h3>
        <PlayerName seat={North} /> — {props.status.north}
        <span className="color-faded"> • </span>
        <PlayerName seat={East} /> — {props.status.east}
        <span className="color-faded"> • </span>
        <PlayerName seat={South} /> — {props.status.south}
        <span className="color-faded"> • </span>
        <PlayerName seat={West} /> — {props.status.west}
      </h3>
    </div>
  )
}
