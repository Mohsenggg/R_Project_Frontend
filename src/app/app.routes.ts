import { Routes } from '@angular/router';



export const routes: Routes = [

      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', loadComponent: () => import('./features/intro/home/pages/home-rahem/home-rahem.component').then(c => c.HomeRahemComponent) },
      { path: 'tree', loadComponent: () => import('./features/tree/classic-view/pages/tree/tree.component').then(c => c.TreeComponent) },

      { path: 'vTree', loadComponent: () => import('./features/tree/dynamic-view/component/view-tree/view-tree.component').then(c => c.ViewTreeComponent) },
      { path: 'home2', loadComponent: () => import('./features/intro/home/pages/home/home.component').then(c => c.HomeComponent) },



];
