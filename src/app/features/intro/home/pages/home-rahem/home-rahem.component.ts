import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TreeDataService } from '../../../../tree/dynamic-view/service/data-access/tree-data.service';
import { MockTreeDataService } from '../../../../tree/dynamic-view/service/data-access/mock-tree-data.service';

@Component({
      selector: 'app-home-rahem',
      standalone: true,
      imports: [CommonModule, RouterLink],
      providers: [
            { provide: TreeDataService, useClass: MockTreeDataService }
      ],
      templateUrl: './home-rahem.component.html',
      styleUrl: './home-rahem.component.css'
})
export class HomeRahemComponent implements OnInit {
      isSidebarOpen: boolean = false;
      nodeCount = signal<number>(0);

      private treeDataService = inject(TreeDataService);

      ngOnInit(): void {
            this.treeDataService.getTreeNodes(1).subscribe(nodes => {
                  this.nodeCount.set(nodes.length - 1);
            });
      }

      toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
      }
}
