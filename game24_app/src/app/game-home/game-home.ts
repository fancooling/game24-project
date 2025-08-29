import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolverService } from '../services/solver.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-game-home',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatListModule],
  templateUrl: './game-home.html',
})
export class GameHome {
  solutionList: WritableSignal<string[]> = signal([]);
  private solverService = inject(SolverService);

  solve(numbers: string) {
    if (!numbers) {
      return;
    }

    this.solverService.solve(numbers).subscribe((solutionList) => {
      this.solutionList.set(solutionList);
    });
  }
}
