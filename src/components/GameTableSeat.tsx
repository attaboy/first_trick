import React from "react"
import { sortHand } from "../lib/games/hearts";
import { PlayingCard } from "./PlayingCard";
import { Seat } from "../lib/seat";
import { Card } from "../lib/card";
import "./GameTableSeat.scss";
import { PlayerName } from "./PlayerName";

interface Props {
  seat: Seat
  hand: Card[]
  turnActive: boolean
  isDealer: boolean
  trickWinner?: boolean
  numTricksTaken: number
  onCardClick: (seat: Seat, card: Card) => void
  validCardForTrick: (card: Card, hand: Card[]) => boolean
}

export function GameTableSeat(props: Props) {
  function onClick(card: Card) {
    props.onCardClick(props.seat, card);
  }

  function tricksTakenLabel() {
    let label = "";
    for (let i = 0; i < props.numTricksTaken; i++) {
      label += "• ";
    }
    return label ? ` ${label}` : "";
  }

  return (
    <div className={`Seat ${
      props.turnActive ? "SeatActive" : ""
    } ${
      props.trickWinner ? "SeatTrickWinner" : ""
    }`} id={`Seat-${props.seat}`}>
      <div className="SeatLabelContainer">
        <h4 className="SeatLabel">
          <PlayerName seat={props.seat} />
          {props.isDealer ? (
            <span> (Dealer)</span>
          ) : null}
          <span className="SeatLabelTrickCounter"> {tricksTakenLabel()}</span>
        </h4>
      </div>
      <div>
        {sortHand(props.hand).map((card) => (
          <PlayingCard invalidCard={!props.validCardForTrick(card, props.hand)} onClick={onClick} key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
