import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonCsv } from './json-csv';

describe('JsonCsv', () => {
  let component: JsonCsv;
  let fixture: ComponentFixture<JsonCsv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonCsv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonCsv);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
