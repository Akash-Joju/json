import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlCsv } from './xml-csv';

describe('XmlCsv', () => {
  let component: XmlCsv;
  let fixture: ComponentFixture<XmlCsv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlCsv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlCsv);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
