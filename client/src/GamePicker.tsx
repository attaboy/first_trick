import React, { useState, useEffect } from 'react';
import './GamePicker.scss';
import { JoinGameEventData, StartGameEventData } from './lib/game_client_event';
import { GameServerEventData } from './lib/game_server_event';
import { NeedsFourPlayers } from './lib/games/game';
import { AllSeats, nameForSeat, Seat } from './lib/seat';

import { GamePickerTableNames } from './components/GamePickerTableNames';
interface Props {
  onCreateGame: (playerName: string) => void
  onQueryGame: (joinCode: string) => void
  onJoinGame: (joinData: JoinGameEventData) => void
  onStartGame: (startData: StartGameEventData) => void
  gameInfo: GameServerEventData | null
  createdGame: boolean
  joinedGame: boolean
}

function useTextInputHandler<T extends HTMLInputElement>(defaultValue: string): [string, (event: React.ChangeEvent<T>) => void] {
  const [value, setValue] = useState(defaultValue);

  function setValueFromEvent(event: React.ChangeEvent<T>) {
    setValue(event.currentTarget.value);
  }

  return [value, setValueFromEvent];
}

export function GamePicker(props: Props) {

  const [joinCode, setJoinCode] = useTextInputHandler("");
  const [playerName, setPlayerName] = useTextInputHandler("");
  const [seatToPick, setSeatToPick] = useState<Seat | null>(null);

  useEffect(() => {
    if (!seatToPick && props.gameInfo) {
      setSeatToPick(firstAvailableSeat(props.gameInfo.players) || null);
    }
  }, [props.gameInfo, seatToPick]);

  function hasName(): boolean {
    return playerName.length > 1;
  }

  function shouldDisableQuery(): boolean {
    return !hasName() || joinCode.length !== 4;
  }

  function shouldDisableCreate(): boolean {
    return !hasName();
  }

  function shouldDisableJoin(): boolean {
    return !hasName() || !seatToPick;
  }

  function createGame() {
    props.onCreateGame(playerName);
  }

  function queryGame() {
    props.onQueryGame(joinCode);
  }

  function joinGame() {
    if (playerName && props.gameInfo && seatToPick) {
      props.onJoinGame({
        name: playerName,
        gameId: props.gameInfo.gameId,
        requestedSeat: seatToPick
      });
    }
  }

  function firstAvailableSeat(players: NeedsFourPlayers): Seat | undefined {
    return AllSeats.find((ea) => !players[ea]);
  }

  function optionsForSeatSelection(players: NeedsFourPlayers) {
    return AllSeats.filter((ea) => !players[ea]).map((ea) => (
      <option key={ea} value={ea}>{nameForSeat(ea)}</option>
    ))
  }

  function updateSeatToPick(event: React.ChangeEvent<HTMLSelectElement>): void {
    setSeatToPick((event.currentTarget.value as Seat) || null);
  }

  function shouldDisableStart(gameInfo: GameServerEventData): boolean {
    return AllSeats.some((seat) => !gameInfo.players[seat]);
  }

  function startGame(gameId: string) {
    props.onStartGame({
      gameId: gameId
    });
  }

  if ((props.createdGame || props.joinedGame) && props.gameInfo) {
    const gameInfo = props.gameInfo;
    return (
      <div className="GamePicker">
        <div>
          <p><b>Waiting for 4 players to join.</b></p>

          <p>Share the join code:</p>

          <code className="GameCode">{gameInfo.joinCode}</code>

          <GamePickerTableNames gameInfo={gameInfo} />

          <p>
            <button type="button"
              className="button"
              onClick={() => startGame(gameInfo.gameId)}
              disabled={shouldDisableStart(props.gameInfo)}
            >Start game</button>
          </p>
        </div>
      </div>
    );
  } else if (props.gameInfo) {
    return (
      <div className="GamePicker">
        <div className="GamePickerJoinConfirm">
          <p>Join the game {props.gameInfo.joinCode}:</p>

          <GamePickerTableNames gameInfo={props.gameInfo} />

          <label className="inputFlex" htmlFor="GamePickerJoinSelectSeat">
            <span>Select an available seat: </span>
            <select id="GamePickerJoinSelectSeat" className="input GamePickerJoinSelectSeat" value={seatToPick || ""} onChange={updateSeatToPick}>
              <option value="">Select…</option>
              {optionsForSeatSelection(props.gameInfo.players)}
            </select>
          </label>

          <p>
            <button
              type="button"
              className="button"
              onClick={joinGame}
              disabled={shouldDisableJoin()}
            >Join game as {playerName}</button>
          </p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="GamePicker">
        <div className="GamePickerNamer">
          <label className="inputFlex" htmlFor="PlayerNameText">
            <span>Enter your first name: </span>
            <input className="input" id="PlayerNameText" type="text" size={20} placeholder="First name" value={playerName} onChange={setPlayerName} />
          </label>
        </div>
        <div className="GamePickerCreate">
          <p><b>Start a new game and invite your friends.</b></p>

          <p>Make a join code you can share.</p>

          <button
            type="button"
            className="button"
            onClick={createGame}
            disabled={shouldDisableCreate()}
          >Create a new game</button>
        </div>
        <div className="GamePickerQuery">
          <p><b>Join an existing game with a code from a friend.</b></p>

          <label className="inputFlex" htmlFor="GameCodeText">
            <span>Join code: </span>
            <input className="input" id="GameCodeText" type="text" size={4} placeholder="Game code" value={joinCode} onChange={setJoinCode} />
          </label>

          <p>
            <button
              type="button"
              className="button"
              onClick={queryGame}
              disabled={shouldDisableQuery()}
            >Join game</button>
          </p>
        </div>
      </div>
    );
  }
}
