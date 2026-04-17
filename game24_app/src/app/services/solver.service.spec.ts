import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SolverService } from './solver.service';

describe('SolverService', () => {
  let service: SolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolverService, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should solve for 1,2,3,4', (done) => {
    service.solve('1,2,3,4').subscribe((solutions) => {
      expect(solutions).toEqual(['(1+2+3)*4', '(1+3)*(2+4)', '1*2*3*4'].sort());
      done();
    });
  });

  it('should normalize whitespace and order-independence', (done) => {
    service.solve('4  3,2\t1').subscribe((solutions) => {
      expect(solutions).toEqual(['(1+2+3)*4', '(1+3)*(2+4)', '1*2*3*4'].sort());
      done();
    });
  });

  it('should return an empty array for empty input', (done) => {
    service.solve('').subscribe((solutions) => {
      expect(solutions).toEqual([]);
      done();
    });
  });

  it('should return an empty array for sanitized input that is empty', (done) => {
    service.solve(', ,').subscribe((solutions) => {
      expect(solutions).toEqual([]);
      done();
    });
  });
});
