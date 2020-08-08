import React, { useState } from 'react';
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
        <p>Awaiting players.</p>

        <p>Game join code: <code><strong>{gameInfo.joinCode}</strong></code></p>

        <GamePickerTableNames gameInfo={gameInfo} />

        <button type="button"
          onClick={() => startGame(gameInfo.gameId)}
          disabled={shouldDisableStart(props.gameInfo)}
        >Start game</button>
      </div>
    );
  } else {
    return (
      <div className="GamePicker">
        <div className="GamePickerNamer">
          <label htmlFor="PlayerNameText">
            <span>Enter your first name:</span>
            <input id="PlayerNameText" type="text" size={20} placeholder="First name" value={playerName} onChange={setPlayerName} />
          </label>
        </div>
        <div className="GamePickerCreate">
          <p>Start a new game and invite your friends.</p>

          <button
            type="button"
            className="button"
            onClick={createGame}
            disabled={shouldDisableCreate()}
          >Create a new game</button>
        </div>
        {props.gameInfo ? (
          <div className="GamePickerJoin">
            <p>Join game {props.gameInfo.joinCode}:</p>

            <GamePickerTableNames gameInfo={props.gameInfo} />

            <select value={seatToPick || ""} onChange={updateSeatToPick}>
              <option value="">Select an available seat…</option>
              {optionsForSeatSelection(props.gameInfo.players)}
            </select>

            <button
              type="button"
              className="button"
              onClick={joinGame}
              disabled={shouldDisableJoin()}
            >Join game</button>
          </div>
        ) : (
          <div className="GamePickerQuery">
            <p>Join an existing game with a code from a friend.</p>

            <label htmlFor="GameCodeText">
              <span>Join code:</span>
              <input id="GameCodeText" type="text" size={4} placeholder="Game code" value={joinCode} onChange={setJoinCode} />
            </label>

            <button
              type="button"
              className="button"
              onClick={queryGame}
              disabled={shouldDisableQuery()}
            >Join game</button>
          </div>
        )}
      </div>
    );
  }
}
