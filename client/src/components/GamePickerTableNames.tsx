import React from 'react';
import './GamePickerTableNames.scss';
import { GameServerEventData } from '../lib/game_server_event';

interface Props {
  gameInfo: GameServerEventData
}

export function GamePickerTableNames(props: Props) {
  return (
    <p>
      <span className="GamePickerJoinPlayer">
        <span className="GamePickerJoinPlayerSeat">North: </span>
        <span className="GamePickerJoinPlayerName">{props.gameInfo.players.north?.name || "(open)"}</span>
      </span>
      <span className="GamePickerJoinPlayer">
        <span className="GamePickerJoinPlayerSeat">East: </span>
        <span className="GamePickerJoinPlayerName">{props.gameInfo.players.east?.name || "(open)"}</span>
      </span>
      <span className="GamePickerJoinPlayer">
        <span className="GamePickerJoinPlayerSeat">South: </span>
        <span className="GamePickerJoinPlayerName">{props.gameInfo.players.south?.name || "(open)"}</span>
      </span>
      <span className="GamePickerJoinPlayer">
        <span className="GamePickerJoinPlayerSeat">West: </span>
        <span className="GamePickerJoinPlayerName">{props.gameInfo.players.west?.name || "(open)"}</span>
      </span>
    </p>
  );
}
