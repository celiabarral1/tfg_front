import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeferredInferenceComponent } from './deferred-inference.component';

describe('DeferredInferenceComponent', () => {
  let component: DeferredInferenceComponent;
  let fixture: ComponentFixture<DeferredInferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeferredInferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeferredInferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
