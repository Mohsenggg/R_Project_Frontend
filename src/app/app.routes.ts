import { Routes } from '@angular/router';
import { HomeComponent } from './features/intro/home/component/home/home.component';
import { TreeComponent } from './features/tree/classic-view/component/tree/tree.component';
import { ViewTreeComponent } from './features/tree/dynamic-view/component/view-tree/view-tree.component';
import { HomeRahemComponent } from './features/intro/home/component/home-rahem/home-rahem.component';


export const routes: Routes = [

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeRahemComponent },
      { path: 'tree', component: TreeComponent },

      { path: 'vTree', component: ViewTreeComponent },
      { path: 'home2', component: HomeComponent },



];
