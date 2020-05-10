import React, { useState } from "react";
import { GameOfHearts, GameOfHeartsUpdate } from "./lib/games/hearts";
import App from "./App";

export function Loader() {
  const [game, setGame] = useState<GameOfHearts | null>(null);
  const [ws] = useState(new WebSocket("ws://localhost:3001/"));

  ws.onmessage = (event) => {
    try {
      const update = JSON.parse(event.data);
      setGame(GameOfHearts.fromJson(update));
    } catch(err) {
      console.log(err);
    }
  };

  function sendUpdate(update: GameOfHeartsUpdate): void {
    ws.send(JSON.stringify(update));
  }

  if (game) {
    return (
      <App game={game} onUpdate={sendUpdate} />
    );
  } else {
    return (
      <div>
        Loading…
      </div>
    )
  }

}