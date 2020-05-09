import React, { useState } from "react";
import { GameOfHearts } from "./lib/games/hearts";
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

  if (game) {
    return (
      <App game={game} setGame={(game) => setGame(game)} />
    );
  } else {
    return (
      <div>
        Loading…
      </div>
    )
  }

}