import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlCode } from './xml-code';

describe('XmlCode', () => {
  let component: XmlCode;
  let fixture: ComponentFixture<XmlCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
