import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeD3TestComponent } from './tree-d3-test.component';

describe('TreeD3TestComponent', () => {
  let component: TreeD3TestComponent;
  let fixture: ComponentFixture<TreeD3TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeD3TestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeD3TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
