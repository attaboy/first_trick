import React from 'react';
import './PlayingCard.css';
import { Card } from "../lib/card";
import { suitSymbol } from '../lib/suit';

interface Props {
  card: Card
}

export function PlayingCard(props: Props) {
  const symbol = suitSymbol(props.card.suit);
  return (
    <div className={`PlayingCard PlayingCardSuit-${props.card.suit}`}>
      <span className="PlayingCardRank">{props.card.rank}</span>
      <span className="PlayingCardSymbol">{symbol}</span>
    </div>
  );
}
