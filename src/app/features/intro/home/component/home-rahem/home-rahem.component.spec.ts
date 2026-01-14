import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeRahemComponent } from './home-rahem.component';

describe('HomeRahemComponent', () => {
  let component: HomeRahemComponent;
  let fixture: ComponentFixture<HomeRahemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeRahemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeRahemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
