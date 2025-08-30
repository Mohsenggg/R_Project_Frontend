import { Component } from '@angular/core';
import { TreeComponent } from "../../../../tree/classic-view/component/tree/tree.component";
import { CommonModule } from '@angular/common';
import { TreeD3TestComponent } from '../../../../tree/modern-view/component/tree-d3-test/tree-d3-test.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TreeComponent, CommonModule, TreeD3TestComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {


  currentTab : string = "";




  showPage(page : string){
    this.currentTab = page;
  }

}
