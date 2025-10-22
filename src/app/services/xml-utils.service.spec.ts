import { TestBed } from '@angular/core/testing';

import { XmlUtilsService } from './xml-utils.service';

describe('XmlUtilsService', () => {
  let service: XmlUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XmlUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
