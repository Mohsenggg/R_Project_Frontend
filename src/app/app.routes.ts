import { Routes } from '@angular/router';



export const routes: Routes = [

      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(c => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(c => c.RegisterComponent) },
      { path: 'tree', loadComponent: () => import('./features/tree/classic-view/pages/tree/tree.component').then(c => c.TreeComponent) },

      { path: 'vTree', loadComponent: () => import('./features/tree/dynamic-view/component/view-tree/view-tree.component').then(c => c.ViewTreeComponent) },



];
