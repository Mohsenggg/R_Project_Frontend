import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TreeComponent } from './components/tree/tree.component';

export const routes: Routes = [

  {path: '', redirectTo:'home', pathMatch: 'full'},
  {path:'home', component: HomeComponent},
  {path:'tree', component: TreeComponent},



];
