import React, { useState } from 'react';
import './App.scss';
import { GameOfHearts, winnerOfTrick } from './lib/games/hearts';
import { StandardDeck } from './lib/deck';
import { Seat, AllSeats } from './lib/seat';
import { GameTableSeat } from './components/GameTableSeat';
import { Card } from './lib/card';
import { PlayerName } from './components/PlayerName';
import { CompletedTrick } from './lib/trick';
import { GameTrick } from './components/GameTrick';
import { GameStatus } from './components/GameStatus';

interface Props {}
interface State {
  deck: StandardDeck;
  game: GameOfHearts;
}

const newGame = GameOfHearts.create(Seat.North);

function App() {
  const [game, setGame] = useState(newGame);

  function restart() {
    setGame(GameOfHearts.create(Seat.North));
  }

  function onCardClick(seat: Seat, card: Card) {
    setGame(game.playCard(seat, card));
  }

  function nextTrick(completedTrick: CompletedTrick) {
    setGame(game.nextTrick(completedTrick))
  }

  const maybeCompletedTrick = game.currentTrick.completedTrick();
  const maybeTrickWinner = maybeCompletedTrick ? winnerOfTrick(maybeCompletedTrick) : null;

  return (
    <div className="App">
      <header className="App-header">
        <GameStatus game={game} />
      </header>
      <section className="GameTable">
        <div>
          {AllSeats.map((seat) => (
            <GameTableSeat
              key={`Seat-${seat}`}
              heartsBroken={game.heartsBroken}
              currentTrick={game.currentTrick}
              seat={seat}
              hand={game[seat].hand}
              turnActive={game.turnActiveFor(seat)}
              isFirstTrick={game.justStarted()}
              isDealer={seat === game.currentDealer}
              trickWinner={seat === maybeTrickWinner}
              numTricksTaken={game[seat].tricksTaken.length}
              onCardClick={onCardClick}
            />
          ))}
        </div>
        {game.gameOver ? null : (
          <GameTrick
            trick={game.currentTrick}
            completedTrick={maybeCompletedTrick}
            trickWinner={maybeTrickWinner}
            onNextTrick={nextTrick}
          />
        )}
      </section>
      <footer>
        <button type="button" onClick={restart}>Restart</button>
      </footer>
    </div>
  );
}

export default App;
