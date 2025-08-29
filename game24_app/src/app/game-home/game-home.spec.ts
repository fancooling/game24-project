import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHome } from './game-home';
import { SolverService } from '../services/solver.service';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('GameHome', () => {
  let component: GameHome;
  let fixture: ComponentFixture<GameHome>;
  let mockSolverService: jasmine.SpyObj<SolverService>;

  beforeEach(async () => {
    // Create a mock SolverService with a spy on the 'solve' method
    mockSolverService = jasmine.createSpyObj('SolverService', ['solve']);

    await TestBed.configureTestingModule({
      imports: [GameHome],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: SolverService, useValue: mockSolverService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should solve for 1,2,3,4', () => {
    // Arrange: Define the predictable return value for our mock service
    const expectedSolutions = ['(1 + 2 + 3) * 4', '1 * 2 * 3 * 4', '(1 + 3) * (2 + 4)'];
    mockSolverService.solve.and.returnValue(of(expectedSolutions));

    const compiled = fixture.nativeElement as HTMLElement;
    const inputElement = compiled.querySelector('input[matInput]') as HTMLInputElement;
    const solveButton = compiled.querySelector('button[mat-flat-button]') as HTMLButtonElement;

    // Act: Simulate user interaction
    inputElement.value = '1,2,3,4';
    inputElement.dispatchEvent(new Event('input'));

    solveButton.click();
    fixture.detectChanges();

    // Assert: Check that the component correctly called the service and updated its list
    expect(mockSolverService.solve).toHaveBeenCalledWith('1,2,3,4');
    expect(component.solutionList()).toEqual(expectedSolutions);
  });

  it('should not call solver service if input is empty', () => {
    // Arrange
    // Ensure the spy is configured, even if we don't expect it to be called.
    mockSolverService.solve.and.returnValue(of([]));

    // Act
    component.solve('');

    // Assert
    expect(mockSolverService.solve).not.toHaveBeenCalled();
  });
});
