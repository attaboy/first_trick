import React from "react";
import { GameOfHearts } from "../lib/games/hearts";
import { PlayerName } from "./PlayerName";

interface Props {
  game: GameOfHearts
}

export function GameStatus(props: Props) {
  const completedTrick = props.game.currentTrick.completedTrick();
  const currentPlayer = props.game.currentPlayer;

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
