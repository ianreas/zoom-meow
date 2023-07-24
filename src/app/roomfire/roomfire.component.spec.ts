import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomfireComponent } from './roomfire.component';

describe('RoomfireComponent', () => {
  let component: RoomfireComponent;
  let fixture: ComponentFixture<RoomfireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomfireComponent]
    });
    fixture = TestBed.createComponent(RoomfireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
