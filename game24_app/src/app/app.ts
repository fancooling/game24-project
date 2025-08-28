import { Component, signal } from '@angular/core';
import { GameHome } from "./game-home/game-home";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameHome],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('game24-angular-ext');
}
