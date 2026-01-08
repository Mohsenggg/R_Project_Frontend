import { Component, computed, inject, signal, OnDestroy, effect, untracked, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { INodeLayout, ITreeNode, ITreeNodesGroup } from '../../model/interface/view-Tree-interfaces';
import { CommonModule } from '@angular/common';

import { MockTreeDataService } from '../../service/data-access/mock-tree-data.service';
import { TreeStructureService } from '../../service/visualization/tree-structure.service';
import { TreeLayoutService } from '../../service/visualization/tree-layout.service';
import { TreeConnectionService } from '../../service/visualization/tree-connection.service';
import { TreeStateService } from '../../service/visualization/tree-state.service';
import { TreePanningService } from '../../service/visualization/tree-panning.service';
import { TreeDataService } from '../../service/data-access/tree-data.service';

@Component({
      selector: 'app-view-tree',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './view-tree.component.html',
      styleUrl: './view-tree.component.css',
      providers: [
            { provide: TreeDataService, useClass: MockTreeDataService },
            TreeStateService,
            TreePanningService
      ]
})
export class ViewTreeComponent implements OnInit, AfterViewInit, OnDestroy {

      //===============================
      // ===== Services =====

      private treeDataService = inject(TreeDataService);
      public structureService = inject(TreeStructureService);
      public layoutService = inject(TreeLayoutService);
      private connectionService = inject(TreeConnectionService);
      public stateService = inject(TreeStateService);
      public panningService = inject(TreePanningService);

      //===============================
      // ===== State Signals =====

      private readonly treeNodes = signal<ITreeNode[]>([]);
      private readonly windowWidth = signal(window.innerWidth);
      private readonly windowHeight = signal(window.innerHeight);

      @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

      //===============================
      // ===== Derived State (Computed) 

      readonly filteredTreeData = computed(() => {
            const rawTreeData = this.treeNodes();
            const selectedMap = this.stateService.selectedNodeIds();
            const dimensions = { width: this.windowWidth(), height: this.windowHeight() };

            // 1. Get visible hierarchy based on selection
            const nodeGroups = this.structureService.getVisibleNodeGroups(rawTreeData, selectedMap);

            // 2. Determine display mode logic (depth)
            const highestLevel = Math.max(...selectedMap.keys(), 0);
            const displayMode = this.layoutService.getDisplayMode(
                  selectedMap.size > 0 ? highestLevel : 1
            );

            // 3. Calculate Layout
            return this.layoutService.calculateLayout(nodeGroups, displayMode, dimensions);
      });

      readonly currentDisplay = computed(() => {
            const selectedMap = this.stateService.selectedNodeIds();
            const highestLevel = Math.max(...selectedMap.keys(), 0);
            return this.layoutService.getDisplayMode(selectedMap.size > 0 ? highestLevel : 1);
      });

      // Connections calculation
      readonly treeLinks = computed(() => {
            return this.connectionService.generateConnections(this.filteredTreeData());
      });

      // Bounds calculation for scrolling
      readonly treeBounds = computed(() => {
            const groups = this.filteredTreeData();
            let maxWidth = this.windowWidth();
            let maxHeight = this.windowHeight();

            groups.forEach(group => {
                  group.nodeList.forEach(node => {
                        if (node.layout) {
                              const right = node.layout.leftSpaceX + node.layout.nodeWidth;
                              const bottom = node.layout.topSpaceY + node.layout.nodeHeight;
                              maxWidth = Math.max(maxWidth, right);
                              maxHeight = Math.max(maxHeight, bottom);
                        }
                  });
            });

            // Add some padding to the bounds
            return {
                  width: maxWidth + 100,
                  height: maxHeight + 100
            };
      });

      //===============================
      // ===== Lifecycle =====

      constructor() {
            window.addEventListener('resize', this.handleResize);

            // Synchronize animatedNodeIds with current visibility
            effect(() => {
                  const groups = this.filteredTreeData(); // Trigger on data change
                  // Delegate logic to State Service
                  this.stateService.syncAnimatedNodes(groups);
            }, { allowSignalWrites: true });
      }

      ngOnInit(): void {
            this.treeDataService.getTreeNodes(1).subscribe(nodes => {
                  this.treeNodes.set(nodes);
            });
      }

      ngAfterViewInit(): void {
            if (this.scrollContainer) {
                  this.panningService.init(this.scrollContainer.nativeElement);
            }
      }

      ngOnDestroy(): void {
            window.removeEventListener('resize', this.handleResize);
            this.panningService.destroy();
      }

      private handleResize = (): void => {
            this.windowWidth.set(window.innerWidth);
            this.windowHeight.set(window.innerHeight);
      };

      // ===============================
      // ======= Panning Logic ========
      // ===============================

      onMouseDown(event: MouseEvent): void {
            this.panningService.onMouseDown(event);
      }

      //===============================
      // ===== User Interactions =====
      //===============================

      onNodeClick(node: ITreeNode): void {
            this.stateService.onNodeClick(node);
      }

      //===============================
      //========== Styling ============
      //===============================

      getNodeStyle(node: ITreeNode): Record<string, any> {
            return this.layoutService.getNodeStyle(node);
      }

      canSelectNode(node: ITreeNode): boolean {
            return this.stateService.canSelectNode(node);
      }

      //===============================
      // ===== Animation Helpers ======
      //===============================

      isNodeNew(nodeId: number): boolean {
            return this.stateService.isNodeNew(nodeId);
      }

      onAnimationEnd(nodeId: number): void {
            this.stateService.onAnimationEnd(nodeId);
      }

      // Helper for template to access selected nodes map
      readonly selectedNodes = computed(() => this.stateService.selectedNodeIds());

}
