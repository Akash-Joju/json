import { TestBed } from '@angular/core/testing';

import { XmlCompareService } from './xml-compare.service';

describe('XmlCompareService', () => {
  let service: XmlCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XmlCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
