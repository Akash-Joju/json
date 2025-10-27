import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonResult } from './json-result';

describe('JsonResult', () => {
  let component: JsonResult;
  let fixture: ComponentFixture<JsonResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
