import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlDiffer } from './xml-differ';

describe('XmlDiffer', () => {
  let component: XmlDiffer;
  let fixture: ComponentFixture<XmlDiffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlDiffer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlDiffer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
