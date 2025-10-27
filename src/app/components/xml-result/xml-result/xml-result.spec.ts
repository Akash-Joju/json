import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlResult } from './xml-result';

describe('XmlResult', () => {
  let component: XmlResult;
  let fixture: ComponentFixture<XmlResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
