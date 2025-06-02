import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BikeManagementComponent } from './bike-management.component';

describe('BikeManagementComponent', () => {
  let component: BikeManagementComponent;
  let fixture: ComponentFixture<BikeManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BikeManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BikeManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
