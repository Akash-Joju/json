import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonDiffer } from './json-differ';

describe('JsonDiffer', () => {
  let component: JsonDiffer;
  let fixture: ComponentFixture<JsonDiffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonDiffer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonDiffer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
