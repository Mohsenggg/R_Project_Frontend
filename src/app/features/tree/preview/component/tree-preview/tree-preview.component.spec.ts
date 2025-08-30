import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePreviewComponent } from './tree-preview.component';

describe('TreePreviewComponent', () => {
  let component: TreePreviewComponent;
  let fixture: ComponentFixture<TreePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreePreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
