import { Component, computed, inject, signal, OnDestroy, effect, untracked, OnInit, ViewChild, ElementRef } from '@angular/core';

import { INodeLayout, ITreeNode, ITreeNodesGroup } from '../../model/interface/view-Tree-interfaces';
import { CommonModule } from '@angular/common';

import { TreeDataService } from '../../service/tree-data.service';
import { MockTreeDataService } from '../../service/mock-tree-data.service';
import { TreeStructureService } from '../../service/tree-structure.service';
import { TreeLayoutService } from '../../service/tree-layout.service';
import { TreeConnectionService } from '../../service/tree-connection.service';

@Component({
      selector: 'app-view-tree',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './view-tree.component.html',
      styleUrl: './view-tree.component.css',
      providers: [
            { provide: TreeDataService, useClass: MockTreeDataService }
      ]
})
export class ViewTreeComponent implements OnInit, OnDestroy {

      //===============================
      // ===== Services =====

      private treeDataService = inject(TreeDataService);
      private structureService = inject(TreeStructureService);
      private layoutService = inject(TreeLayoutService);
      private connectionService = inject(TreeConnectionService);

      //===============================
      // ===== State Signals =====

      private readonly treeNodes = signal<ITreeNode[]>([]);
      private readonly windowWidth = signal(window.innerWidth);
      private readonly windowHeight = signal(window.innerHeight);
      private readonly selectedNodeIds = signal<Map<number, number>>(new Map());
      private readonly animatedNodeIds = signal<Set<number>>(new Set());

      @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

      // Panning state
      private isDragging = false;
      private panStartX = 0;
      private panStartY = 0;
      private panScrollLeft = 0;
      private panScrollTop = 0;


      //===============================
      // ===== Derived State (Computed) 

      readonly filteredTreeData = computed(() => {
            const rawTreeData = this.treeNodes();
            const selectedMap = this.selectedNodeIds();
            const dimensions = { width: this.windowWidth(), height: this.windowHeight() };

            // 1. Get visible hierarchy based on selection
            const nodeGroups = this.structureService.getVisibleNodeGroups(rawTreeData, selectedMap);

            // 2. Determine display mode logic (depth)
            // Need deepest level from the selection map to determine global scaling
            const highestLevel = Math.max(...selectedMap.keys(), 0);
            // If map is empty, max() is -Infinity, so 0 ensures safety.
            // But we actually need to check if map is empty before passing to logic or handle it.
            // The service logic handles fallback, so passing actual max level is fine.
            // Wait, existing logic used `getDeepestSelectedNodeLevel` which had fallbacks.

            const displayMode = this.layoutService.getDisplayMode(
                  selectedMap.size > 0 ? highestLevel : 1
            );

            // 3. Calculate Layout
            return this.layoutService.calculateLayout(nodeGroups, displayMode, dimensions);
      });

      readonly currentDisplay = computed(() => {
            const selectedMap = this.selectedNodeIds();
            const highestLevel = Math.max(...selectedMap.keys(), 0);
            return this.layoutService.getDisplayMode(selectedMap.size > 0 ? highestLevel : 1);
      });

      readonly selectedNodes = computed(() => this.selectedNodeIds());

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
            // This ensures that if a node leaves the view, it's forgotten and can animate again if it re-appears.
            effect(() => {
                  const groups = this.filteredTreeData(); // Trigger on data change
                  const visibleIds = new Set<number>();
                  groups.forEach(g => g.nodeList.forEach(n => visibleIds.add(n.id)));

                  const currentAnimated = untracked(this.animatedNodeIds);
                  const pruned = new Set<number>();
                  let changed = false;

                  currentAnimated.forEach(id => {
                        if (visibleIds.has(id)) {
                              pruned.add(id);
                        } else {
                              changed = true;
                        }
                  });

                  if (changed) {
                        this.animatedNodeIds.set(pruned);
                  }
            }, { allowSignalWrites: true });
      }

      ngOnInit(): void {
            // Fetch data on initialization. 
            // In a real app, you might get the treeId from route params.
            this.treeDataService.getTreeNodes(1).subscribe(nodes => {
                  this.treeNodes.set(nodes);
            });
      }

      ngOnDestroy(): void {
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('mousemove', this.onMouseMove);
      }

      private handleResize = (): void => {
            this.windowWidth.set(window.innerWidth);
            this.windowHeight.set(window.innerHeight);
      };

      // ===============================
      // ======= Panning Logic ========
      // ===============================

      onMouseDown(event: MouseEvent): void {
            // Only left click
            if (event.button !== 0) return;

            // Check if clicking on a card - if so, don't pan (let it be a selection)
            const target = event.target as HTMLElement;
            if (target.closest('.member-card')) return;

            this.isDragging = true;
            const container = this.scrollContainer.nativeElement;

            this.panStartX = event.pageX - container.offsetLeft;
            this.panStartY = event.pageY - container.offsetTop;
            this.panScrollLeft = container.scrollLeft;
            this.panScrollTop = container.scrollTop;

            container.classList.add('panning');
            container.style.cursor = 'grabbing';
            container.style.userSelect = 'none';

            // Add global listeners to handle dragging outside the container
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
      }

      onMouseMove = (event: MouseEvent): void => {
            if (!this.isDragging) return;

            event.preventDefault();
            const container = this.scrollContainer.nativeElement;

            const x = event.pageX - container.offsetLeft;
            const y = event.pageY - container.offsetTop;

            const walkX = (x - this.panStartX) * 1.5; // Drag speed multiplier
            const walkY = (y - this.panStartY) * 1.5;

            container.scrollLeft = this.panScrollLeft - walkX;
            container.scrollTop = this.panScrollTop - walkY;
      };

      onMouseUp = (): void => {
            if (!this.isDragging) return;

            this.isDragging = false;
            const container = this.scrollContainer.nativeElement;
            container.classList.remove('panning');
            container.style.cursor = 'grab';
            container.style.removeProperty('user-select');

            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
      };



      //===============================
      // ===== User Interactions =====
      //===============================

      onNodeClick(node: ITreeNode): void {
            // Allow selection of nodes between level 1 and 5.
            // Level 0 (root) and Level 6 (deepest) are not selectable.
            if (node.level !== undefined && node.level > 0 && node.level < 6) {
                  this.selectNode(node.level, node.id);
            } else {
                  console.warn('Node selection restricted for level:', node.level);
                  return;
            }
      }

      selectNode(level: number, nodeId: number): void {
            if (level < 0 || level > 6) {
                  console.warn(`Invalid level ${level}. Must be between 0 and 6.`);
                  return;
            }

            const currentMap = new Map(this.selectedNodeIds());
            currentMap.set(level, nodeId);

            // Clear deeper selections
            for (let i = level + 1; i <= 6; i++) {
                  currentMap.delete(i);
            }

            this.selectedNodeIds.set(currentMap);
      }


      //===============================
      //========== Styling ============
      //===============================


      getNodeStyle(node: ITreeNode): Record<string, any> {

            let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }
            if (node.layout) {
                  nodeLayout = node.layout;
            }

            return {
                  'width.px': nodeLayout.nodeWidth,
                  'height.px': nodeLayout.nodeHeight,
                  'left.px': nodeLayout.leftSpaceX,
                  'top.px': nodeLayout.topSpaceY,
            };
      }

      canSelectNode(node: ITreeNode): boolean {
            const level = node.level;
            // Only levels 1 through 5 are selectable to reveal deeper levels.
            return level !== undefined && level > 0 && level < 6;
      }

      //===============================
      // ======= Helper Methods =======
      //===============================

      clearAllSelections(): void {
            this.selectedNodeIds.set(new Map());
      }


      //===============================
      // ===== Animation Helpers ======
      //===============================

      /**
       * Checks if a node is new and should trigger the entrance animation.
       * Side-effect free to be safe for template usage.
       */
      isNodeNew(nodeId: number): boolean {
            return !this.animatedNodeIds().has(nodeId);
      }

      /**
       * Cleans up the .enter class after the CSS animation finishes.
       * Adds the nodeId to the set of already animated nodes.
       */
      onAnimationEnd(nodeId: number): void {
            const currentSet = new Set(this.animatedNodeIds());
            if (!currentSet.has(nodeId)) {
                  currentSet.add(nodeId);
                  this.animatedNodeIds.set(currentSet);
            }
      }

}
