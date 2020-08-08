import React from 'react';
import { GameServerEventData } from '../lib/game_server_event';

interface Props {
  gameInfo: GameServerEventData
}

export function GamePickerTableNames(props: Props) {
  return (
    <p>
      <span className="GamePickerJoinPlayer">North: {props.gameInfo.players.north?.name || "(open)"} </span>
      <span className="GamePickerJoinPlayer">East: {props.gameInfo.players.east?.name || "(open)"} </span>
      <span className="GamePickerJoinPlayer">South: {props.gameInfo.players.south?.name || "(open)"} </span>
      <span className="GamePickerJoinPlayer">West: {props.gameInfo.players.west?.name || "(open)"} </span>
    </p>
  );
}
