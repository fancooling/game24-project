import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import urlJoin from 'url-join';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class SolverService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

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

    // Robustly join the URL parts, ensuring exactly one slash between the base and the numbers.
    // This prevents issues regardless of whether urlBase has a trailing slash.
    const url = urlJoin(this.configService.urlBase, numbers, '/');
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
