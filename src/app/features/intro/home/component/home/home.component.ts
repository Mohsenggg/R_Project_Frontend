import { Component } from '@angular/core';
import { TreeComponent } from "../../../../tree/classic-view/component/tree/tree.component";
import { CommonModule } from '@angular/common';

@Component({
      selector: 'app-home',
      standalone: true,
      imports: [TreeComponent, CommonModule],
      templateUrl: './home.component.html',
      styleUrl: './home.component.css'
})
export class HomeComponent {

      currentTab: string = "";
      isRightSectionVisible: boolean = true; // Default to showing right section (Welcome/Tree side)

      showPage(page: string) {
            this.currentTab = page;
      }

      toggleSection(): void {
            this.isRightSectionVisible = !this.isRightSectionVisible;
      }

}
