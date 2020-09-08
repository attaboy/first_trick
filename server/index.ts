import express from 'express';
import http, { Server } from 'http';
import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

import { GameOfHearts, CreateGameOfHearts } from '../client/src/lib/games/hearts';
import { North, AllSeats } from '../client/src/lib/seat';
import * as CE from '../client/src/lib/game_client_event';
import * as SE from '../client/src/lib/game_server_event';
import { PlayerIdentity } from '../client/src/lib/player';

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const activeGames: Map<string, SE.GameServerEvent> = new Map();
// let theGame = GameOfHearts.create(North);
const sockets: Map<string, WebSocket> = new Map();

function getAllGames(): SE.GameServerEvent[] {
  return Array.from(activeGames.values());
}

function allPlayersForGame(game: SE.GameServerEventData): Array<[string, WebSocket]> {
  const activePlayers = AllSeats.map((seat) => game.players[seat]).filter((player): player is PlayerIdentity => Boolean(player));
  activePlayers
  return Array.from(sockets.entries())
    .filter(([playerId, _]) => activePlayers.some((player) => playerId === player.id));
}

function addPlayerIdToEvent(event: SE.ServerEvent, playerId: string): SE.ServerEvent {
  const players = SE.isGameEventData(event.eventData) ? event.eventData.players : null;
  const selfSeat = players ? AllSeats.find((seat) => players[seat]?.id === playerId) : null;
  const updatedEventData: SE.ServerEventData = Object.assign({}, event.eventData, {
    playerId,
    selfSeat
  });
  const updatedEvent: SE.ServerEvent = Object.assign({}, event, {
    eventData: updatedEventData
  });
  return updatedEvent;
}

function send(socket: WebSocket, playerId: string, event: SE.ServerEvent) {
  socket.send(JSON.stringify(addPlayerIdToEvent(event, playerId)), ((err) => {
    if (err) {
      console.error(`Error sending ${event.eventType} to player ID ${playerId}: %o`, err);
    } else {
      console.debug(`Sent ${event.eventType} event to player ID ${playerId}`);
    }
  }));
}

function sendPlayer(playerId: string, event: SE.ServerEvent) {
  const socket = sockets.get(playerId);
  if (socket) {
    send(socket, playerId, event);
  }
}

function sendAll(event: SE.GameServerEvent) {
  console.log(`Sending event ${event.eventType} to all players`);
  const receivers = allPlayersForGame(event.eventData);
  receivers.forEach(([playerId, socket]) => send(socket, playerId, event));
}

function parseMessage(message: string): CE.GameClientEvent | null {
  try {
    const obj = JSON.parse(message);
    if (CE.isGameClientEvent(obj)) {
      console.log("Received client event: %o", obj);
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

function createGame(clientData: CE.CreateGameEventData, playerId: string): void {
  const gameId = uuidv4();
  const joinCode = createNewJoinCode();
  const gameData: SE.GameServerEventData = {
    playerId,
    gameId,
    joinCode,
    gameStatus: SE.GameAwaitingPlayers,
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
  const event: SE.GameCreatedEvent = {
    eventType: SE.GameCreatedEventType,
    eventData: gameData
  };
  activeGames.set(gameId, event);
  sendPlayer(playerId, event);
}

function queryGame(clientData: CE.QueryGameEventData, playerId: string): void {
  const game = getAllGames().find((ea) => ea.eventData.joinCode === clientData.joinCode);
  if (game) {
    const event: SE.GameAvailableEvent = {
      eventType: SE.GameAvailableEventType,
      eventData: game.eventData
    }
    sendPlayer(playerId, event);
  } else {
    noGameError(CE.QueryGameEventType, clientData.joinCode, playerId);
  }
}

function joinGame(clientData: CE.JoinGameEventData, playerId: string): void {
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
      game.eventType = SE.GameJoinedEventType;
      game.eventData.players[requestedSeat] = newPlayer;
      sendAll(game);
    } else {
      console.error(`Can't join seat ${clientData.requestedSeat} for player ID ${playerId} on game ID ${clientData.gameId}`);
    }
  } else {
    noGameError(CE.JoinGameEventType, clientData.gameId, playerId);
  }
}

function startGame(clientData: CE.StartGameEventData, playerId: string): void {
  const game = activeGames.get(clientData.gameId);
  if (game) {
    const north = game.eventData.players.north;
    const east = game.eventData.players.east;
    const south = game.eventData.players.south;
    const west = game.eventData.players.west;
    if (north && east && south && west) {
      const hearts = CreateGameOfHearts(North);
      const newEventData: SE.ActiveGameEventData = Object.assign({}, game.eventData, {
        game: hearts,
        selfSeat: North // this gets replaced by sendAll
      });
      const event: SE.GameUpdatedEvent = {
        eventType: SE.GameUpdatedEventType,
        eventData: newEventData
      };
      activeGames.set(clientData.gameId, event);
      sendAll(event);
    }
  } else {
    noGameError(CE.StartGameEventType, clientData.gameId, playerId);
  }
}

function updateGame(clientData: CE.PlayGameEventData, playerId: string): void {
  console.log("Preparing update event");
  const game = activeGames.get(clientData.gameId);
  if (game) {
    if (SE.isActiveGameData(game.eventData)) {
      const updatedGame: GameOfHearts = Object.assign({}, game.eventData.game, clientData.update);
      const event: SE.GameUpdatedEvent = {
        eventType: SE.GameUpdatedEventType,
        eventData: Object.assign({}, game.eventData, {
          game: updatedGame
        })
      };
      activeGames.set(clientData.gameId, event);
      sendAll(event);
    } else {
      console.error(`Tried to update non-active game for game ID ${clientData.gameId} from player ID ${playerId}`);
      // TODO: not an active game
    }
  } else {
    noGameError(CE.PlayGameEventType, clientData.gameId, playerId);
  }
}

function noGameError(eventType: CE.GameClientEventType,gameId: string, playerId: string) {
  console.error(`No game found for game ID ${gameId} for ${eventType} event sent by player ID ${playerId}`);
}

wss.on('connection', (ws: WebSocket) => {
  const playerId = uuidv4();
  sockets.set(playerId, ws);

  const readyEvent: SE.ServerReadyEvent = {
    eventType: SE.ReadyEventType,
    eventData: {
      playerId
    }
  };
  sendPlayer(playerId, readyEvent);

  ws.on('message', (updateMessage: string) => {
    console.log("Received message:", updateMessage);
    const event = parseMessage(updateMessage);
    if (event) {
      if (CE.isCreateGameEvent(event)) {
        createGame(event.eventData, playerId);
      } else if (CE.isQueryGameEvent(event)) {
        queryGame(event.eventData, playerId);
      } else if (CE.isJoinGameEvent(event)) {
        joinGame(event.eventData, playerId)
      } else if (CE.isStartGameEvent(event)) {
        startGame(event.eventData, playerId);
      } else if (CE.isPlayGameEvent(event)) {
        updateGame(event.eventData, playerId);
      } else {
        console.error("Unknown event type received.");
      }
    } else {
      console.error("Invalid message received.");
    }
  });
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
