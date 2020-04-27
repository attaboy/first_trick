import React from "react"
import { sortHand } from "../lib/games/hearts";
import { PlayingCard } from "./PlayingCard";
import { Seat } from "../lib/seat";
import { Card } from "../lib/card";
import "./GameTableSeat.scss";
import { Trick } from "../lib/trick";
import { PlayerName } from "./PlayerName";

interface Props {
  heartsBroken: boolean
  currentTrick: Trick
  seat: Seat
  hand: Card[]
  turnActive: boolean
  trickWinner?: boolean
  onCardClick: (seat: Seat, card: Card) => void
}

export function GameTableSeat(props: Props) {
  function onClick(card: Card) {
    props.onCardClick(props.seat, card);
  }

  function validCard(card: Card): boolean {
    const leadCard = props.currentTrick[props.currentTrick.lead];
    if (!leadCard) {
      return true;
    }
    if (props.hand.some((ea) => ea.suit === leadCard.suit)) {
      return card.suit === leadCard.suit;
    } else {
      return true;
    }
  }

  return (
    <div className={`Seat ${
      props.turnActive ? "SeatActive" : ""
    } ${
      props.trickWinner ? "SeatTrickWinner" : ""
    }`} id={`Seat-${props.seat}`}>
      <h4 className="SeatLabel"><PlayerName seat={props.seat} /></h4>
      <div>
        {sortHand(props.hand).map((card) => (
          <PlayingCard invalidCard={!validCard(card)} onClick={onClick} key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
