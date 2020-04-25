import { StandardDeck } from "../deck";
import { Game } from "./game";

export class GameOfHearts implements Game {
  deck: StandardDeck;

  constructor() {
    this.deck = new StandardDeck(true);
    console.log(this.deck);
  }
}
