import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioRecordedComponent } from './audio-recorded.component';

describe('AudioRecordedComponent', () => {
  let component: AudioRecordedComponent;
  let fixture: ComponentFixture<AudioRecordedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioRecordedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioRecordedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
