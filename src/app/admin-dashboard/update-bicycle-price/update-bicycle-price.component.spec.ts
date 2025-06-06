import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBicyclePriceComponent } from './update-bicycle-price.component';

describe('UpdateBicyclePriceComponent', () => {
  let component: UpdateBicyclePriceComponent;
  let fixture: ComponentFixture<UpdateBicyclePriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBicyclePriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBicyclePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
