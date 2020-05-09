import { Card } from "./card";
import { Seat } from "./seat";
import { CompletedTrick } from "./trick";

export interface PlayerJson {
  position: Seat
  hand: Card[]
  cardsToPass: Card[]
  score: number
  tricksTaken: CompletedTrick[]
}

export interface Player extends Readonly<PlayerJson> {}

export function dealCardFor(player: Player, card: Card): Player {
  return Object.assign({}, player, {
    hand: player.hand.concat([card])
  });
}

export function playCardFor(player: Player, card: Card): Player {
  return Object.assign({}, player, {
    hand: player.hand.filter((ea) => ea !== card)
  });
}

export function selectCardToPassFor(player: Player, card: Card): Player {
  const currentCards = player.cardsToPass;
  const newCards = currentCards.includes(card) ?
    currentCards.filter((ea) => ea !== card) :
    currentCards.concat([card]).slice(-3);
  return Object.assign({}, player, {
    cardsToPass: newCards
  });
}

export function takeTrickFor(player: Player, trick: CompletedTrick): Player {
  return Object.assign({}, player, {
    tricksTaken: player.tricksTaken.concat([trick])
  });
}

export function passAndReceiveCardsFor(player: Player, toReceive: Card[]): Player {
  return Object.assign({}, player, {
    hand: player.hand.filter((ea) => !player.cardsToPass.includes(ea)).concat(toReceive),
    cardsToPass: []
  });
}

export function addScoreFor(player: Player, addScore: number): Player {
  return Object.assign({}, player, {
    score: player.score + addScore
  });
}

export function CreatePlayer(position: Seat): Player {
  return {
    position,
    hand: [],
    score: 0,
    tricksTaken: [],
    cardsToPass: []
  };
}
