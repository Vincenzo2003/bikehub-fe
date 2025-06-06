import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBikeModalComponent } from './add-bike-modal.component';

describe('AddBikeModalComponent', () => {
  let component: AddBikeModalComponent;
  let fixture: ComponentFixture<AddBikeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBikeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBikeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
