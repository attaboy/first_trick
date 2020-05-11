import { Seat } from "./seat"
import { GameOfHeartsUpdate } from "./games/hearts"

export const CreateGameEventType = "create"
export const JoinGameEventType = "join"
export const PlayGameEventType = "play"

export type GameClientEventType =
  typeof CreateGameEventType
  | typeof JoinGameEventType
  | typeof PlayGameEventType

export interface GameClientEventData {
  seat: Seat
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

export interface JoinGameEvent extends GameClientEvent {
  eventType: typeof JoinGameEventType
  eventData: JoinGameEventData
}

export interface JoinGameEventData extends GameClientEventData, ActiveGameEventData {
  name: string
}

export interface PlayGameEvent extends GameClientEvent {
  eventType: typeof PlayGameEventType
  eventData: PlayGameEventData
}

export interface PlayGameEventData extends GameClientEventData, ActiveGameEventData {
  update: GameOfHeartsUpdate
}
