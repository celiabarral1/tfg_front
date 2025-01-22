import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftRepresentationComponent } from './shift-representation.component';

describe('ShiftRepresentationComponent', () => {
  let component: ShiftRepresentationComponent;
  let fixture: ComponentFixture<ShiftRepresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftRepresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftRepresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
