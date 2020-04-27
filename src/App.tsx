import React, { useState } from 'react';
import './App.scss';
import { GameOfHearts, winnerOfTrick } from './lib/games/hearts';
import { StandardDeck } from './lib/deck';
import { Seat, AllSeats } from './lib/seat';
import { GameTableSeat } from './components/GameTableSeat';
import { Card } from './lib/card';
import { PlayingCard } from './components/PlayingCard';
import { PlayerName } from './components/PlayerName';
import { CompletedTrick } from './lib/trick';

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
        <h3>Dealer: <PlayerName seat={game.currentDealer} /></h3>
        <h2>
          {maybeCompletedTrick ? (
            <strong><PlayerName seat={game.currentPlayer} /><span> takes the trick!</span></strong>
          ) : (
            <span><span>It’s </span><PlayerName seat={game.currentPlayer} /><span>’s turn.</span></span>
          )}
        </h2>
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
              trickWinner={seat === maybeTrickWinner}
              onCardClick={onCardClick}
            />
          ))}
        </div>
        <div id="GameTrick">
          <div id="GameTrickNorth">
            {game.currentTrick.north ? (
              <PlayingCard card={game.currentTrick.north} />
            ) : null}
          </div>
          <div id="GameTrickEast">
            {game.currentTrick.east ? (
              <PlayingCard card={game.currentTrick.east} />
            ) : null}
          </div>
          <div id="GameTrickSouth">
            {game.currentTrick.south ? (
              <PlayingCard card={game.currentTrick.south} />
            ) : null}
          </div>
          <div id="GameTrickWest">
            {game.currentTrick.west ? (
              <PlayingCard card={game.currentTrick.west} />
            ) : null}
          </div>
          {maybeCompletedTrick && maybeTrickWinner ? (
            <button className={`GameNextTrickButton GameNextTrickButton-${maybeTrickWinner}`}
             type="button" onClick={() => nextTrick(maybeCompletedTrick)}>OK</button>
          ) : null}
        </div>
      </section>
      <footer>
        <button type="button" onClick={restart}>Restart</button>
      </footer>
    </div>
  );
}

export default App;
