import React from "react";
import { CompletedTrick, Trick } from "../lib/trick";
import { Seat } from "../lib/seat";
import { PlayingCard } from "./PlayingCard";

interface Props {
  trick: Trick
  completedTrick: CompletedTrick | null
  trickWinner: Seat | null
  onNextTrick: (completedTrick: CompletedTrick) => void
}

export function GameTrick(props: Props) {

  function buttonLabel(seat: Seat) {
    switch(seat) {
      case Seat.North:
        return "▲";
      case Seat.East:
        return "▶︎";
      case Seat.South:
        return "▼";
      case Seat.West:
        return "◀︎";
    }
  }

  function nextTrickButton() {
    const completedTrick = props.completedTrick;
    const winner = props.trickWinner;
    if (completedTrick && winner) {
      return (
        <div className={`GameNextTrickContainer GameNextTrickContainer-${winner}`}>
          <button className={`GameNextTrickButton`}
            type="button" onClick={() => props.onNextTrick(completedTrick)}>
            {buttonLabel(winner)}
          </button>
        </div>
      );
    }
  }

  return (
    <div id="GameTrick">
      <div id="GameTrickNorth">
        {props.trick.north ? (
          <PlayingCard card={props.trick.north} />
        ) : null}
      </div>
      <div id="GameTrickEast">
        {props.trick.east ? (
          <PlayingCard card={props.trick.east} />
        ) : null}
      </div>
      <div id="GameTrickSouth">
        {props.trick.south ? (
          <PlayingCard card={props.trick.south} />
        ) : null}
      </div>
      <div id="GameTrickWest">
        {props.trick.west ? (
          <PlayingCard card={props.trick.west} />
        ) : null}
      </div>
      {nextTrickButton()}
    </div>
  );
}
