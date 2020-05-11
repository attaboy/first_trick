import { Seat } from "./seat"

const GameCreatedEventType = "created"
const GameJoinedEventType = "joined"
const GameUpdatedEventType = "updated"
const GameErrorEventType = "error"

export type GameServerEventType =
  typeof GameCreatedEventType
  | typeof GameJoinedEventType
  | typeof GameUpdatedEventType
  | typeof GameErrorEventType

export interface GameServerEventData {
  gameId: string
  seat: Seat
}

export interface GameServerEvent {
  eventType: GameServerEventType
  eventData: GameServerEventData
}

export interface GameCreatedEvent extends GameServerEvent {
  eventType: typeof GameCreatedEventType
  eventData: GameCreatedEventData
}

export const GameAwaitingPlayers = "awaitingPlayers"
export const GameReady = "ready"

export type GameStatus =
  typeof GameAwaitingPlayers
  | typeof GameReady

interface GameCreatedEventData extends GameServerEventData {
  gameStatus: GameStatus
}
