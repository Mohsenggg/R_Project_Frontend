import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTreeComponent } from './view-tree.component';

describe('ViewTreeComponent', () => {
  let component: ViewTreeComponent;
  let fixture: ComponentFixture<ViewTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
