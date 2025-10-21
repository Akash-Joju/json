import { TestBed } from '@angular/core/testing';

import { JsonUtilsService } from './json-utils.service';

describe('JsonUtilsService', () => {
  let service: JsonUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
