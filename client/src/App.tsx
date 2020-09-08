import React, { useState } from 'react';
import './App.scss';
import { GameOfHearts, winnerOfTrick, GameOfHeartsStatus, nextPassModeAfter, GameOfHeartsUpdate, CreateGameOfHearts, passCards, selectCardToPass, playCard, nextTrick, turnActiveFor, validCard } from './lib/games/hearts';
import { Seat, AllSeats, North } from './lib/seat';
import { GameTableSeat } from './components/GameTableSeat';
import { Card } from './lib/card';
import { CompletedTrick, Trick, completedTrickFrom } from './lib/trick';
import { GameTrick } from './components/GameTrick';
import { GameStatus } from './components/GameStatus';
import { GameOver } from './components/GameOver';
import { nextPlayerAfter, NeedsFourPlayers } from './lib/games/game';
import { GamePassConfirmation } from './components/GamePassConfirmation';
import { GameServerEventData } from './lib/game_server_event';

interface Props {
  game: GameOfHearts
  players: NeedsFourPlayers
  selfSeat: Seat
  onUpdate: (update: GameOfHeartsUpdate, seat: Seat) => void
}

interface State {
  deck: Card[];
  game: GameOfHearts;
  status: GameOfHeartsStatus
}

const newStatus: GameOfHeartsStatus = {
  north: 0,
  east: 0,
  south: 0,
  west: 0,
  handsPlayed: 0
}

function App(props: Props) {
  const game = props.game;
  const [previousStatus, setPreviousStatus] = useState(newStatus);

  function update(updateData: GameOfHeartsUpdate) {
    props.onUpdate(updateData, props.selfSeat);
  }

  function restart() {
    update(CreateGameOfHearts(North));
  }

  function passCardsAndUpdate() {
    update(passCards(game));
  }

  function onCardClick(seat: Seat, card: Card, trick: Trick | null) {
    if (game.passingModeActive) {
      update(selectCardToPass(game, seat, card));
    } else if (trick) {
      update(playCard(game, seat, card, trick));
    }
  }

  function nextTrickAndUpdate(completedTrick: CompletedTrick) {
    update(nextTrick(game, completedTrick))
  }

  function startNewGame() {
    setPreviousStatus({
      north: previousStatus.north + game.north.score,
      east: previousStatus.east + game.east.score,
      south: previousStatus.south + game.south.score,
      west: previousStatus.west + game.west.score,
      handsPlayed: previousStatus.handsPlayed + 1
    });
    update(CreateGameOfHearts(nextPlayerAfter(game.currentDealer), nextPassModeAfter(game.passMode)));
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

  const maybeCompletedTrick = game.currentTrick && completedTrickFrom(game.currentTrick);
  const maybeTrickWinner = maybeCompletedTrick ? winnerOfTrick(maybeCompletedTrick) : null;

  return (
    <div className="App">
      <header className="App-header">
        <GameStatus game={game} players={props.players} status={currentStatus()} />
      </header>
      <section className="GameTable">
        <div>
          {AllSeats.map((seat) => (
            <GameTableSeat
              key={`Seat-${seat}`}
              seat={seat}
              name={props.players[seat]?.name}
              isSelf={props.selfSeat === seat}
              canSeeOthers={false}
              hand={game[seat].hand}
              selectedCards={game[seat].cardsToPass}
              currentTrick={game.currentTrick}
              turnActive={turnActiveFor(game, seat)}
              trickWinner={seat === maybeTrickWinner}
              numTricksTaken={game[seat].tricksTaken.length}
              onCardClick={onCardClick}
              validCard={(card, hand, trick) => validCard(game, card, hand, trick)}
            />
          ))}
        </div>
        {game.passingModeActive ? (
          <GamePassConfirmation
            game={game}
            onClick={passCardsAndUpdate}
          />
        ) : null}
        {game.gameOver ? (
          <GameOver
            game={game}
            players={props.players}
            status={previousStatus}
            onNewGame={startNewGame}
          />
        ) : null}
        {!game.gameOver && game.currentTrick ? (
          <GameTrick
            trick={game.currentTrick}
            completedTrick={maybeCompletedTrick}
            trickWinner={maybeTrickWinner}
            onNextTrick={nextTrickAndUpdate}
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
