import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioVadLiveComponent } from './audio-vad-live.component';

describe('AudioVadLiveComponent', () => {
  let component: AudioVadLiveComponent;
  let fixture: ComponentFixture<AudioVadLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioVadLiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioVadLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
