import { Seat } from "./seat"
import { GameOfHeartsUpdate } from "./games/hearts"

export const CreateGameEventType = "create"
export const QueryGameEventType = "query"
export const JoinGameEventType = "join"
export const StartGameEventType = "start"
export const PlayGameEventType = "play"

export type GameClientEventType =
  typeof CreateGameEventType
  | typeof QueryGameEventType
  | typeof JoinGameEventType
  | typeof StartGameEventType
  | typeof PlayGameEventType

export interface GameClientEventData {
}

export interface ActiveGameEventData extends GameClientEventData {
  gameId: string
}

export interface GameClientEvent {
  eventType: GameClientEventType
  eventData: GameClientEventData
}

export interface CreateGameEvent extends GameClientEvent {
  eventType: typeof CreateGameEventType
  eventData: CreateGameEventData
}

export interface CreateGameEventData extends GameClientEventData {
  name: string
}

export interface QueryGameEvent extends GameClientEvent {
  eventType: typeof QueryGameEventType
  eventData: QueryGameEventData
}

export interface QueryGameEventData extends GameClientEventData {
  joinCode: string
}

export interface JoinGameEvent extends GameClientEvent {
  eventType: typeof JoinGameEventType
  eventData: JoinGameEventData
}

export interface JoinGameEventData extends GameClientEventData, ActiveGameEventData {
  name: string
  requestedSeat: Seat
}

export interface StartGameEvent extends GameClientEvent {
  eventType: typeof StartGameEventType
  eventData: StartGameEventData
}

export interface StartGameEventData extends GameClientEventData, ActiveGameEventData {
}

export interface PlayGameEvent extends GameClientEvent {
  eventType: typeof PlayGameEventType
  eventData: PlayGameEventData
}

export interface PlayGameEventData extends GameClientEventData, ActiveGameEventData {
  update: GameOfHeartsUpdate
}

export function isGameClientEvent(obj: any): obj is GameClientEvent {
  return Boolean(obj && typeof obj === "object" && typeof obj.eventType === "string" && typeof obj.eventData === "object");
}

export function isCreateGameEvent(event: GameClientEvent): event is CreateGameEvent {
  return event.eventType === CreateGameEventType;
}

export function isQueryGameEvent(event: GameClientEvent): event is QueryGameEvent {
  return event.eventType === QueryGameEventType;
}

export function isJoinGameEvent(event: GameClientEvent): event is JoinGameEvent {
  return event.eventType === JoinGameEventType;
}

export function isStartGameEvent(event: GameClientEvent): event is StartGameEvent {
  return event.eventType === StartGameEventType;
}

export function isPlayGameEvent(event: GameClientEvent): event is PlayGameEvent {
  return event.eventType === PlayGameEventType;
}
