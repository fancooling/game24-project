import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { solve as localSolve } from '../solver/solver';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  solve(numberStr: string): Observable<string[]> {
    if (!numberStr) {
      return of([]);
    }

    const numbers = numberStr
      .trim()
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      return of([]);
    }

    return of(localSolve(numbers));
  }
}
