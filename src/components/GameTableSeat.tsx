import React from "react"
import { sortHand } from "../lib/games/hearts";
import { PlayingCard } from "./PlayingCard";
import { Seat } from "../lib/seat";
import { Card } from "../lib/card";
import "./GameTableSeat.scss";
import { Trick } from "../lib/trick";
import { PlayerName } from "./PlayerName";
import { Suit } from "../lib/suit";
import { Rank } from "../lib/rank";

interface Props {
  heartsBroken: boolean
  currentTrick: Trick
  seat: Seat
  hand: Card[]
  turnActive: boolean
  isFirstTrick: boolean
  isDealer: boolean
  trickWinner?: boolean
  numTricksTaken: number
  onCardClick: (seat: Seat, card: Card) => void
}

export function GameTableSeat(props: Props) {
  function onClick(card: Card) {
    props.onCardClick(props.seat, card);
  }

  function validCard(card: Card): boolean {
    const leadCard = props.currentTrick[props.currentTrick.lead];
    if (!leadCard && props.isFirstTrick) {
      return card.suit === Suit.Clubs && card.rank === Rank.Two;
    } else if (!leadCard) {
      return props.heartsBroken ||
        card.suit !== Suit.Hearts ||
        props.hand.every((ea) => ea.suit === Suit.Hearts);
    } else if (props.hand.some((ea) => ea.suit === leadCard.suit)) {
      return card.suit === leadCard.suit;
    } else {
      return true;
    }
  }

  function tricksTakenLabel() {
    let label = "";
    for (let i = 0; i < props.numTricksTaken; i++) {
      label += "•";
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
        </h4>
        <span>{tricksTakenLabel()}</span>
      </div>
      <div>
        {sortHand(props.hand).map((card) => (
          <PlayingCard invalidCard={!validCard(card)} onClick={onClick} key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
