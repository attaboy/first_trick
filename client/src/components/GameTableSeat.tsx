import React from "react"
import { sortHand } from "../lib/games/hearts";
import { PlayingCard } from "./PlayingCard";
import { Seat } from "../lib/seat";
import { Card } from "../lib/card";
import "./GameTableSeat.scss";
import { PlayerName } from "./PlayerName";
import { Trick } from "../lib/trick";

interface Props {
  seat: Seat
  hand: Card[]
  selectedCards: Card[]
  currentTrick: Trick | null
  turnActive: boolean
  isDealer: boolean
  trickWinner?: boolean
  numTricksTaken: number
  onCardClick: (seat: Seat, card: Card, trick: Trick | null) => void
  validCard: (card: Card, hand: Card[], trick: Trick | null) => boolean
}

export function GameTableSeat(props: Props) {
  function onClick(card: Card) {
    props.onCardClick(props.seat, card, props.currentTrick);
  }

  function tricksTakenLabel() {
    let label = "";
    for (let i = 0; i < props.numTricksTaken; i++) {
      label += "• ";
    }
    return label ? ` ${label}` : "";
  }

  function invalidCard(card: Card): boolean {
    const canSelectCard = !props.currentTrick || props.turnActive;
    return !canSelectCard || !props.validCard(card, props.hand, props.currentTrick);
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
          <PlayingCard
            selected={props.selectedCards.includes(card)}
            invalidCard={invalidCard(card)}
            onClick={onClick}
            key={`${card.rank}-${card.suit}`}
            card={card}
          />
        ))}
      </div>
    </div>
  );
}
