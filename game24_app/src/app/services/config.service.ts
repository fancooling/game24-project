import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  public readonly urlBase: string;

  constructor() {
    // Check for the Chrome extension runtime. This is the most reliable indicator.
    const win = window as Window & { chrome?: any };
    if (win.chrome?.runtime?.id) {
      // We are in the Chrome Extension
      this.urlBase = 'https://game24.flamebots.org/game24/solve/';
    } else {
      // We are on the regular website
      // Use a root-relative path to ensure API calls work correctly from any page in the app.
      this.urlBase = '/game24/solve/';
    }
  }
}
