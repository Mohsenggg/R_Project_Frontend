import { Routes } from '@angular/router';
import { HomeComponent } from './features/intro/home/component/home/home.component';
import { TreeComponent } from './features/tree/classic-view/component/tree/tree.component';
import { ViewTreeComponent } from './features/tree/dynamic-view/component/view-tree/view-tree.component';


export const routes: Routes = [

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'tree', component: TreeComponent },
  
      { path: 'vTree', component: ViewTreeComponent },
  


];
