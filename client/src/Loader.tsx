import React, { useState, useEffect } from "react";
import App from "./App";
import { GamePicker } from "./GamePicker";
import { GameOfHearts, GameOfHeartsUpdate } from "./lib/games/hearts";
import * as CE from "./lib/game_client_event";
import * as SE from "./lib/game_server_event";
import { Seat } from "./lib/seat";

enum Status {
  Loading = "loading",
  NewGame = "new",
  GameAvailable = "available",
  GameCreated = "created",
  GameJoined = "joined",
  GameStarted = "started",
  GameUpdated = "updated",
}

export function Loader() {
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [gameInfo, setGameInfo] = useState<SE.GameServerEventData | null>(null);
  const [gameData, setGameData] = useState<GameOfHearts | null>(null);
  const [selfSeat, setSelfSeat] = useState<Seat | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [createdGame, setCreatedGame] = useState(false);
  const [joinedGame, setJoinedGame] = useState(false);

  useEffect(() => {
    function receiveEvent(event: SE.ServerEvent) {
      if (event.eventData.selfSeat && event.eventData.selfSeat !== selfSeat) {
        setSelfSeat(event.eventData.selfSeat);
      }
      if (SE.isReadyEvent(event)) {
        setStatus(Status.NewGame);
      } else if (SE.isGameCreatedEvent(event)) {
        setGameInfo(event.eventData);
        setStatus(Status.GameCreated);
        setCreatedGame(true);
      } else if (SE.isGameAvailableEvent(event)) {
        setGameInfo(event.eventData);
        setStatus(Status.GameAvailable);
      } else if (SE.isGameJoinedEvent(event)) {
        setGameInfo(event.eventData);
        setStatus(Status.GameJoined);
        setJoinedGame(true);
      } else if (SE.isGameStartedEvent(event)) {
        setGameInfo(event.eventData);
        setGameData(event.eventData.game);
        setStatus(Status.GameStarted);
      } else if (SE.isGameUpdatedEvent(event)) {
        setGameInfo(event.eventData);
        setGameData(event.eventData.game);
        setStatus(Status.GameUpdated);
      } else if (SE.isServerErrorEvent(event)) {
        console.log("Server error:", event);
      }
    }

    if (!socket) {
      try {
        const ws = new WebSocket("ws://localhost:3001/");
        ws.onmessage = (messageEvent: MessageEvent) => {
          console.log("Received message:", messageEvent);
          const event = parseMessage(messageEvent.data);
          if (event) {
            console.log("Valid event:", event);
            receiveEvent(event);
          } else {
            console.error("Invalid event");
          }
        };
        setSocket(ws);
      } catch(err) {
        console.error("Error opening socket:", err);
      }
    }

    return () => {
      if (socket) {
        console.log("Closing socket");
        socket.close();
        setSocket(null);
      }
    }
  }, [socket]);

  function parseMessage(message: string): SE.ServerEvent | null {
    try {
      const obj = JSON.parse(message);
      if (SE.isServerEvent(obj)) {
        return obj;
      } else {
        throw new Error(`Unexpected message received from server:\n${message}`);
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function send(event: CE.GameClientEvent): void {
    if (socket) {
      socket.send(JSON.stringify(event));
    }
  }

  function sendUpdate(update: GameOfHeartsUpdate, seat: Seat): void {
    setGameData(Object.assign({}, gameData, update));
    if (socket && gameInfo) {
      const event: CE.PlayGameEvent = {
        eventType: CE.PlayGameEventType,
        eventData: {
          gameId: gameInfo.gameId,
          update
        }
      };
      send(event);
    }
  }

  function onCreateGame(name: string): void {
    if (socket) {
      const event: CE.CreateGameEvent = {
        eventType: CE.CreateGameEventType,
        eventData: {
          name
        }
      };
      send(event);
    }
  }

  function onQueryGame(joinCode: string): void {
    if (socket) {
      const event: CE.QueryGameEvent = {
        eventType: CE.QueryGameEventType,
        eventData: {
          joinCode
        }
      };
      send(event);
    }
  }

  function onJoinGame(joinData: CE.JoinGameEventData): void {
    if (socket) {
      const event: CE.JoinGameEvent = {
        eventType: CE.JoinGameEventType,
        eventData: joinData
      }
      send(event);
    }
  }

  function onStartGame(startData: CE.StartGameEventData): void {
    if (socket) {
      const event: CE.StartGameEvent = {
        eventType: CE.StartGameEventType,
        eventData: startData
      }
      send(event);
    }
  }

  if (status === Status.Loading) {
    return (
      <div>
        Loading…
      </div>
    );
  } else if (gameData && selfSeat && gameInfo) {
    return (
      <App game={gameData} players={gameInfo.players} selfSeat={selfSeat} onUpdate={sendUpdate} />
    );
  } else {
    return (
      <GamePicker
        onCreateGame={onCreateGame}
        onQueryGame={onQueryGame}
        onJoinGame={onJoinGame}
        onStartGame={onStartGame}
        gameInfo={gameInfo}
        createdGame={createdGame}
        joinedGame={joinedGame}
      />
    );
  }
}
