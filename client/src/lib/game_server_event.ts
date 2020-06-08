import { Seat, AllSeats } from "./seat"
import { NeedsFourPlayers } from "./games/game"
import { GameOfHearts } from "./games/hearts"

export const ReadyEventType = "ready"
export const ServerErrorEventType = "error"
export const GameCreatedEventType = "created"
export const GameAvailableEventType = "available"
export const GameJoinedEventType = "joined"
export const GameStartedEventType = "started"
export const GameUpdatedEventType = "updated"

export type ServerEventType =
  typeof ReadyEventType
  | typeof ServerErrorEventType
  | typeof GameCreatedEventType
  | typeof GameAvailableEventType
  | typeof GameJoinedEventType
  | typeof GameStartedEventType
  | typeof GameUpdatedEventType

interface ServerEventData {
  playerId: string
  selfSeat?: Seat
}

export interface ServerEvent {
  eventType: ServerEventType
  eventData: ServerEventData
}

export interface ServerReadyEvent extends ServerEvent {
  eventType: typeof ReadyEventType
}

export interface ServerErrorEvent extends ServerEvent {
  eventType: typeof ServerErrorEventType
}

export interface GameServerEventData extends ServerEventData {
  gameId: string
  joinCode: string
  gameStatus: GameStatus
  players: NeedsFourPlayers
}

export const GameAwaitingPlayers = "awaitingPlayers"
export const GameReady = "ready"
export const GameInterrupted = "interrupted"

export type GameStatus =
  typeof GameAwaitingPlayers
  | typeof GameReady
  | typeof GameInterrupted

export interface GameServerEvent extends ServerEvent {
  eventData: GameServerEventData
}

export interface GameCreatedEvent extends GameServerEvent {
  eventType: typeof GameCreatedEventType
  eventData: GameServerEventData
}

export interface GameAvailableEvent extends GameServerEvent {
  eventType: typeof GameAvailableEventType
  eventData: GameServerEventData
}

export interface GameJoinedEvent extends GameServerEvent {
  eventType: typeof GameJoinedEventType
  eventData: GameServerEventData
}

export interface ActiveGameEventData extends GameServerEventData {
  game: GameOfHearts
  selfSeat: Seat
}

export interface GameStartedEvent extends GameServerEvent {
  eventType: typeof GameStartedEventType
  eventData: ActiveGameEventData
}

export interface GameUpdatedEvent extends GameServerEvent {
  eventType: typeof GameUpdatedEventType
  eventData: ActiveGameEventData
}

export function isCreatedGameData(event: GameServerEvent): event is GameCreatedEvent {
  return event.eventType === GameCreatedEventType;
}

export function findEmptySeat(event: GameServerEvent): Seat | undefined {
  return AllSeats.find((seat) => !event.eventData.players[seat]);
}

export function isGameEventData(eventData: ServerEventData): eventData is GameServerEventData {
  return ['gameId', 'joinCode', 'gameStatus', 'players'].every((key) => Boolean((eventData as GameServerEventData)[key as keyof GameServerEventData]));
}

export function isActiveGameData(eventData: GameServerEventData): eventData is ActiveGameEventData {
  return Boolean((eventData as ActiveGameEventData).game);
}

export function isServerEvent(obj: any): obj is ServerEvent {
  return Boolean(obj && typeof obj === "object" && typeof obj.eventType === "string" && typeof obj.eventData === "object");
}

export function isReadyEvent(event: ServerEvent): event is ServerReadyEvent {
  return event.eventType === ReadyEventType;
}

export function isGameCreatedEvent(event: ServerEvent): event is GameCreatedEvent {
  return event.eventType === GameCreatedEventType;
}

export function isGameAvailableEvent(event: ServerEvent): event is GameAvailableEvent {
  return event.eventType === GameAvailableEventType;
}

export function isGameJoinedEvent(event: ServerEvent): event is GameJoinedEvent {
  return event.eventType === GameJoinedEventType;
}

export function isGameStartedEvent(event: ServerEvent): event is GameStartedEvent {
  return event.eventType === GameStartedEventType;
}

export function isGameUpdatedEvent(event: ServerEvent): event is GameUpdatedEvent {
  return event.eventType === GameUpdatedEventType;
}

export function isServerErrorEvent(event: ServerEvent): event is ServerErrorEvent {
  return event.eventType === ServerErrorEventType;
}
