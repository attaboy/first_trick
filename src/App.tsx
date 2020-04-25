import React, { useState } from 'react';
import './App.css';
import { GameOfHearts } from './lib/games/hearts';
import { PlayingCard } from './components/PlayingCard';

interface Props {}
interface State {
  game: GameOfHearts;
}

const newGame = new GameOfHearts();

function App() {
  const [game, setGame] = useState(newGame);

  function shuffle() {
    setGame(new GameOfHearts());
  }

  function hands(game: GameOfHearts) {
    const cards = game.deck.cards;
    return [cards.slice(0, 13), cards.slice(13, 26), cards.slice(26, 39), cards.slice(39)];
  }

  return (
    <div className="App">
      <header className="App-header">
        <button type="button" onClick={shuffle}>Shuffle</button>
      </header>
      <section>
        {hands(game).map((hand, index) => (
          <div key={`hand${index}`}>
            <h4>Player {index + 1}</h4>
            <div>
              {hand.map((card) => (
                <PlayingCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
