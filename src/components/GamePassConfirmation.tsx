import React from "react";
import { GameOfHearts } from "../lib/games/hearts";

interface Props {
  game: GameOfHearts
  onClick: () => void
}

export function GamePassConfirmation(props: Props) {

  function onClick() {
    props.onClick();
  }

  function notReady() {
    return !props.game.readyToPass()
  }

  return (
    <div id="GamePassConfirmation">
      <button type="button" className="button" onClick={onClick} disabled={notReady()}>Ready to pass</button>
    </div>
  )
}
