import express from 'express';
import http from 'http';
import * as WebSocket from 'ws';
import {GameOfHeartsJson, GameOfHearts} from '../client/src/lib/games/hearts';
import { North } from '../client/src/lib/seat';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

  //connection is up, let's add a simple simple event
  ws.on('message', (message: string) => {

    //log the received message and send it back to the client
    console.log('received: %s', message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection
  const newGame = GameOfHearts.create(North);

  ws.send(JSON.stringify(newGame));
});

server.listen(3001, () => {
  console.log('listening on *:3001');
});
