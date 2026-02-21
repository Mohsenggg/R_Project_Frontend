import { Routes } from '@angular/router';
import { TreeComponent } from './features/tree/classic-view/pages/tree/tree.component';
import { ViewTreeComponent } from './features/tree/dynamic-view/component/view-tree/view-tree.component';
import { HomeRahemComponent } from './features/intro/home/pages/home-rahem/home-rahem.component';
import { HomeComponent } from './features/intro/home/pages/home/home.component';


export const routes: Routes = [

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeRahemComponent },
      { path: 'tree', component: TreeComponent },

      { path: 'vTree', component: ViewTreeComponent },
      { path: 'home2', component: HomeComponent },



];
