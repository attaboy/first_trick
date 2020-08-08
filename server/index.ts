import express from 'express';
import http from 'http';
import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

import { GameOfHearts } from '../client/src/lib/games/hearts';
import { North, AllSeats } from '../client/src/lib/seat';
import { GameClientEvent, isPlayGameEvent, isGameClientEvent, isJoinGameEvent, PlayGameEventData, isCreateGameEvent, CreateGameEventData, JoinGameEventData, isQueryGameEvent, QueryGameEventData, isStartGameEvent, StartGameEventData } from '../client/src/lib/game_client_event';
import { GameUpdatedEvent, GameUpdatedEventType, GameServerEventData, GameCreatedEvent, GameCreatedEventType, GameAwaitingPlayers, GameServerEvent, GameJoinedEventType, GameAvailableEvent, GameAvailableEventType, isActiveGameData, ServerEvent, ReadyEventType, ServerReadyEvent, isGameEventData } from '../client/src/lib/game_server_event';
import { PlayerIdentity } from '../client/src/lib/player';

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const activeGames: Map<string, GameServerEvent> = new Map();
// let theGame = GameOfHearts.create(North);
const sockets: Map<string, WebSocket> = new Map();

function getAllGames(): GameServerEvent[] {
  return Array.from(activeGames.values());
}

function allPlayersForGame(game: GameServerEventData): Array<[string, WebSocket]> {
  const activePlayers = AllSeats.map((seat) => game.players[seat]).filter((player): player is PlayerIdentity => Boolean(player));
  activePlayers
  return Array.from(sockets.entries())
    .filter(([playerId, _]) => activePlayers.some((player) => playerId === player.id));
}

function addPlayerToEvent(event: ServerEvent, playerId: string): ServerEvent {
  const players = isGameEventData(event.eventData) ? event.eventData.players : null;
  const selfSeat = players ? AllSeats.find((seat) => players[seat]?.id === playerId) : null;
  return Object.assign({}, event, {
    playerId,
    selfSeat
  });
}

function send(socket: WebSocket, playerId: string, event: ServerEvent) {
  socket.send(JSON.stringify(addPlayerToEvent(event, playerId)));
}

function sendPlayer(playerId: string, event: ServerEvent) {
  const socket = sockets.get(playerId);
  if (socket) {
    send(socket, playerId, event);
  }
}

function sendAll(event: GameServerEvent) {
  const receivers = allPlayersForGame(event.eventData);
  receivers.forEach(([playerId, socket]) => send(socket, playerId, event));
}

function parseMessage(message: string): GameClientEvent | null {
  try {
    const obj = JSON.parse(message);
    if (isGameClientEvent(obj)) {
      console.log("Received client event:", obj);
      return obj;
    } else {
      throw new Error(`Unexpected client message:\n${message}`);
    }
  } catch(err) {
    console.error(err);
    return null;
  }
}

function createNewJoinCode(): string {
  const allGames = getAllGames();
  let code = "";
  // do {
    code = `${a2z()}${a2z()}${a2z()}${a2z()}`;
  // } while (allGames.length > 0 && allGames.every((game) => game.eventData.joinCode === code));
  return code;
}

function a2z(): string {
  return alphabet[Math.floor(Math.random() * 26)];
}

function createGame(clientData: CreateGameEventData, playerId: string): void {
  const gameId = uuidv4();
  const joinCode = createNewJoinCode();
  const gameData: GameServerEventData = {
    playerId,
    gameId,
    joinCode,
    gameStatus: GameAwaitingPlayers,
    players: {
      north: {
        position: North,
        id: playerId,
        name: clientData.name
      },
      east: null,
      south: null,
      west: null
    }
  };
  const event: GameCreatedEvent = {
    eventType: GameCreatedEventType,
    eventData: gameData
  };
  activeGames.set(gameId, event);
  sendPlayer(playerId, event);
}

function queryGame(clientData: QueryGameEventData, playerId: string): void {
  const game = getAllGames().find((ea) => ea.eventData.joinCode === clientData.joinCode);
  if (game) {
    const event: GameAvailableEvent = {
      eventType: GameAvailableEventType,
      eventData: game.eventData
    }
    sendPlayer(playerId, event);
  }
}

function joinGame(clientData: JoinGameEventData, playerId: string): void {
  const game = activeGames.get(clientData.gameId);
  if (game) {
    const requestedSeat = clientData.requestedSeat;
    const existingPlayer = game.eventData.players[requestedSeat];
    if (!existingPlayer) {
      const newPlayer: PlayerIdentity = {
        position: requestedSeat,
        id: playerId,
        name: clientData.name
      };
      game.eventType = GameJoinedEventType;
      game.eventData.players[requestedSeat] = newPlayer;
      sendAll(game);
    } else {
      // TODO: can't join this seat
    }
  } else {
    // TODO: no game!
  }
}

function startGame(clientData: StartGameEventData, playerId: string): void {
  const game = activeGames.get(clientData.gameId);
  if (game) {
    const north = game.eventData.players.north;
    const east = game.eventData.players.east;
    const south = game.eventData.players.south;
    const west = game.eventData.players.west;
    if (north && east && south && west) {
      const hearts = GameOfHearts.create(North);
      const event: GameUpdatedEvent = {
        eventType: GameUpdatedEventType,
        eventData: Object.assign({}, game.eventData, {
          game: GameOfHearts.create(North),
          selfSeat: North // this gets replaced by sendAll
        })
      };
      activeGames.set(clientData.gameId, event);
      sendAll(event);
    }
  } else {
    // TODO: no game!
  }
}

function updateGame(clientData: PlayGameEventData, playerId: string): void {
  const game = activeGames.get(clientData.gameId);
  if (game) {
    if (isActiveGameData(game.eventData)) {
      const event: GameUpdatedEvent = {
        eventType: GameUpdatedEventType,
        eventData: Object.assign(game.eventData, {
          game: Object.assign({}, game.eventData.game, clientData.update)
        })
      };
      activeGames.set(clientData.gameId, event);
      sendAll(event);
    } else {
      // TODO: not an active game
    }
  } else {
    // TODO: no game!
  }
}

wss.on('connection', (ws: WebSocket) => {
  const playerId = uuidv4();
  sockets.set(playerId, ws);

  const readyEvent: ServerReadyEvent = {
    eventType: ReadyEventType,
    eventData: {
      playerId
    }
  };
  sendPlayer(playerId, readyEvent);

  ws.on('message', (updateMessage: string) => {
    console.log("Received message:", updateMessage);
    const event = parseMessage(updateMessage);
    if (event) {
      if (isCreateGameEvent(event)) {
        createGame(event.eventData, playerId);
      } else if (isQueryGameEvent(event)) {
        queryGame(event.eventData, playerId);
      } else if (isJoinGameEvent(event)) {
        joinGame(event.eventData, playerId)
      } else if (isStartGameEvent(event)) {
        startGame(event.eventData, playerId);
      } else if (isPlayGameEvent(event)) {
        updateGame(event.eventData, playerId);
      }
    } else {
      // TODO: invalid message
    }
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
