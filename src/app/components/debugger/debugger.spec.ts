import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debugger } from './debugger';

describe('Debugger', () => {
  let component: Debugger;
  let fixture: ComponentFixture<Debugger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Debugger]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Debugger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
