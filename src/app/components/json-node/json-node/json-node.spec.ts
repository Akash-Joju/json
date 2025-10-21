import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonNode } from './json-node';

describe('JsonNode', () => {
  let component: JsonNode;
  let fixture: ComponentFixture<JsonNode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonNode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonNode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
