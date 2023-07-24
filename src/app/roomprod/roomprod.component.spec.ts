import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomprodComponent } from './roomprod.component';

describe('RoomprodComponent', () => {
  let component: RoomprodComponent;
  let fixture: ComponentFixture<RoomprodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomprodComponent]
    });
    fixture = TestBed.createComponent(RoomprodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
