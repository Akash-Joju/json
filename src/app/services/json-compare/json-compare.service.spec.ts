import { TestBed } from '@angular/core/testing';

import { JsonCompareService } from './json-compare.service';

describe('JsonCompareService', () => {
  let service: JsonCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
