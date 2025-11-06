import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacySummary } from './privacy-summary';

describe('PrivacySummary', () => {
  let component: PrivacySummary;
  let fixture: ComponentFixture<PrivacySummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacySummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacySummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
