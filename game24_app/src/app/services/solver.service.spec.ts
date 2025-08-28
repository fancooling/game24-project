import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { SolverService } from './solver.service';

describe('SolverService', () => {
  let service: SolverService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SolverService],
    });
    service = TestBed.inject(SolverService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should solve for 1,2,3,4', () => {
    const testData = { solutions: ['(1+2+3)*4', '1*2*3*4'] };
    const expectedSolutions = ['(1+2+3)*4', '1*2*3*4'];

    service.solve('1,2,3,4').subscribe((solutions) => {
      expect(solutions).toEqual(expectedSolutions);
    });

    const req = httpTestingController.expectOne(
      '/game24/solve/1,2,3,4/'
    );
    expect(req.request.method).toEqual('GET');
    req.flush(testData);
  });

  it('should handle various whitespace separators', () => {
    const testData = { solutions: ['(1+2+3)*4'] };

    service.solve('4  3,2\t1').subscribe((solutions) => {
      expect(solutions).toEqual(testData.solutions);
    });

    // The service normalizes the input to '4,3,2,1'
    const req = httpTestingController.expectOne(
      '/game24/solve/4,3,2,1/'
    );
    req.flush(testData);
  });

  it('should return an empty array for empty input', () => {
    service.solve('').subscribe((solutions) => {
      expect(solutions).toEqual([]);
    });
  });

  it('should return an empty array for sanitized input that is empty', () => {
    service.solve(', ,').subscribe((solutions) => {
      expect(solutions).toEqual([]);
    });
    // No HTTP call should be made since the input is effectively empty after sanitizing.
    httpTestingController.expectNone(service.urlBase);
  });

  it('should handle API errors gracefully by returning an empty array', () => {
    const emsg = 'deliberate 404 error';

    service.solve('1,2,3,4').subscribe((solutions) => {
      expect(solutions).toEqual([]);
    });

    const req = httpTestingController.expectOne(
      '/game24/solve/1,2,3,4/'
    );
    // Simulate an error response from the server.
    req.flush(emsg, { status: 404, statusText: 'Not Found' });
  });

  it('should handle a malformed API response by returning an empty array', () => {
    const malformedResponse = { data: 'wrong_key' }; // Does not have 'solutions' key
    service.solve('1,2,3,4').subscribe((solutions) => {
      expect(solutions).toEqual([]);
    });
    const req = httpTestingController.expectOne('/game24/solve/1,2,3,4/');
    req.flush(malformedResponse);
  });
});
