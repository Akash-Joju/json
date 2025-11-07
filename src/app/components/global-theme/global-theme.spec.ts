import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalTheme } from './global-theme';

describe('GlobalTheme', () => {
  let component: GlobalTheme;
  let fixture: ComponentFixture<GlobalTheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalTheme]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalTheme);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
