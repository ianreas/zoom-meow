import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerroomComponent } from './answerroom.component';

describe('AnswerroomComponent', () => {
  let component: AnswerroomComponent;
  let fixture: ComponentFixture<AnswerroomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerroomComponent]
    });
    fixture = TestBed.createComponent(AnswerroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
