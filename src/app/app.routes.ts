import { Routes } from '@angular/router';
import { HomeComponent } from './features/intro/home/component/home/home.component';
import { TreeComponent } from './features/tree/classic-view/component/tree/tree.component';
import { TreeD3TestComponent } from './features/tree/modern-view/component/tree-d3-test/tree-d3-test.component';
import { TreePreviewComponent } from './features/tree/preview/component/tree-preview/tree-preview.component';
import { ViewTreeComponent } from './features/tree/tree/component/view-tree/view-tree.component';

export const routes: Routes = [

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'tree', component: TreeComponent },
      { path: 'tree-test', component: TreeD3TestComponent },
      { path: 'tree-preview', component: TreePreviewComponent },

      { path: 'vTree', component: ViewTreeComponent },



];
