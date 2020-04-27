import React from 'react';
import './PlayingCard.scss';
import { Card } from "../lib/card";
import { suitSymbol } from '../lib/suit';

interface Props {
  card: Card
  invalidCard?: boolean
  onClick?: (card: Card) => void
}

export function PlayingCard(props: Props) {
  const symbol = suitSymbol(props.card.suit);

  function onClick() {
    if (props.onClick && !props.invalidCard) {
      props.onClick(props.card);
    }
  }

  return (
    <div
      onClick={onClick}
      className={`PlayingCard PlayingCardSuit-${props.card.suit} ${
        props.invalidCard ? "PlayingCardInvalid" : "PlayingCardValid"
      }`}
    >
      <span className="PlayingCardRank">{props.card.rank}</span>
      <span className="PlayingCardSymbol">{symbol}</span>
    </div>
  );
}
