import React, { useState } from 'react';
import './App.scss';
import { GameOfHearts, winnerOfTrick, GameOfHeartsStatus } from './lib/games/hearts';
import { StandardDeck } from './lib/deck';
import { Seat, AllSeats } from './lib/seat';
import { GameTableSeat } from './components/GameTableSeat';
import { Card } from './lib/card';
import { CompletedTrick, Trick } from './lib/trick';
import { GameTrick } from './components/GameTrick';
import { GameStatus } from './components/GameStatus';
import { GameOver } from './components/GameOver';
import { nextPlayerAfter } from './lib/games/game';
import { GamePassConfirmation } from './components/GamePassConfirmation';

interface Props {}
interface State {
  deck: StandardDeck;
  game: GameOfHearts;
  status: GameOfHeartsStatus
}

const newGame = GameOfHearts.create(Seat.North);
const newStatus: GameOfHeartsStatus = {
  north: 0,
  east: 0,
  south: 0,
  west: 0,
  handsPlayed: 0
}

function App() {
  const [game, setGame] = useState(newGame);
  const [previousStatus, setPreviousStatus] = useState(newStatus);

  function restart() {
    setGame(GameOfHearts.create(Seat.North));
  }

  function passCards() {
    setGame(game.passCards());
  }

  function onCardClick(seat: Seat, card: Card, trick: Trick | null) {
    if (game.passingModeActive) {
      setGame(game.selectCardToPass(seat, card))
    } else if (trick) {
      setGame(game.playCard(seat, card, trick));
    }
  }

  function nextTrick(completedTrick: CompletedTrick) {
    setGame(game.nextTrick(completedTrick))
  }

  function startNewGame() {
    setPreviousStatus({
      north: previousStatus.north + game.north.score,
      east: previousStatus.east + game.east.score,
      south: previousStatus.south + game.south.score,
      west: previousStatus.west + game.west.score,
      handsPlayed: previousStatus.handsPlayed + 1
    });
    setGame(GameOfHearts.create(nextPlayerAfter(game.currentDealer)))
  }

  function currentStatus(): GameOfHeartsStatus {
    return {
      north: previousStatus.north + game.north.score,
      east: previousStatus.east + game.east.score,
      south: previousStatus.south + game.south.score,
      west: previousStatus.west + game.west.score,
      handsPlayed: previousStatus.handsPlayed + (game.gameOver ? 1 : 0)
    };
  }

  const maybeCompletedTrick = game.currentTrick && game.currentTrick.completedTrick();
  const maybeTrickWinner = maybeCompletedTrick ? winnerOfTrick(maybeCompletedTrick) : null;

  return (
    <div className="App">
      <header className="App-header">
        <GameStatus game={game} status={currentStatus()} />
      </header>
      <section className="GameTable">
        <div>
          {AllSeats.map((seat) => (
            <GameTableSeat
              key={`Seat-${seat}`}
              seat={seat}
              hand={game[seat].hand}
              selectedCards={game[seat].cardsToPass}
              currentTrick={game.currentTrick}
              turnActive={game.turnActiveFor(seat)}
              isDealer={seat === game.currentDealer}
              trickWinner={seat === maybeTrickWinner}
              numTricksTaken={game[seat].tricksTaken.length}
              onCardClick={onCardClick}
              validCard={(card, hand, trick) => game.validCard(card, hand, trick)}
            />
          ))}
        </div>
        {game.passingModeActive ? (
          <GamePassConfirmation
            game={game}
            onClick={passCards}
          />
        ) : null}
        {game.gameOver ? (
          <GameOver
            game={game}
            status={previousStatus}
            onNewGame={startNewGame}
          />
        ) : null}
        {!game.gameOver && game.currentTrick ? (
          <GameTrick
            trick={game.currentTrick}
            completedTrick={maybeCompletedTrick}
            trickWinner={maybeTrickWinner}
            onNextTrick={nextTrick}
          />
        ) : null}
      </section>
      <footer>
        <button className="button" type="button" onClick={restart}>Restart</button>
      </footer>
    </div>
  );
}

export default App;
