import express from 'express';
import http from 'http';
import * as WebSocket from 'ws';
import { GameOfHearts, GameOfHeartsUpdate } from '../client/src/lib/games/hearts';
import { North } from '../client/src/lib/seat';
import { GameClientEvent } from '../client/src/lib/game_client_event';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let theGame = GameOfHearts.create(North);
const sockets: WebSocket[] = [];

function sendGame(): void {
  sockets.forEach((ws) => ws.send(JSON.stringify(theGame)));
}

function parseMessage(message: string): GameClientEvent | null {

}

wss.on('connection', (ws: WebSocket) => {
  sockets.push(ws);

  function updateGame(update: GameOfHeartsUpdate): void {
    theGame = theGame.clone(update);
    sendGame();
  }

  //connection is up, let's add a simple simple event
  ws.on('message', (updateMessage: string) => {

    //log the received message and send it back to the client
    console.log('received: %s', updateMessage);
    updateGame(JSON.parse(updateMessage));
  });

  sendGame();
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
