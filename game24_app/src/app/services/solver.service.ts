import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  readonly urlBase = '/game24/solve/';
  private http = inject(HttpClient);

  solve(numberStr: string): Observable<string[]> {
    if (!numberStr) {
      return of([]);
    }

    // Split by any combination of commas and whitespace, and remove empty or NaN entries.
    const numbers = numberStr
      .trim()
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n))
      .map((n) => n.toString())
      .join(',');

    if (!numbers) {
      return of([]);
    }

    const url = this.urlBase + numbers + '/';
    return this.http.get<{ solutions: string[] }>(url).pipe(
      map((result) => {
        console.log('Fetched solutions:', result);
        // The API returns an object like { solutions: [...] }, so we extract that array.
        return result.solutions ?? [];
      }),
      catchError((error) => {
        console.error('Failed to fetch solutions', error);
        return of([]); // Return an observable of an empty array on error
      }),
    );
  }
}
