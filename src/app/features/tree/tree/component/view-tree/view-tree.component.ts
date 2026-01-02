import { Component, computed, effect, inject, signal, OnDestroy } from '@angular/core';
import { INodeLayout, ITreeNode, ITreeNodesGroup } from '../../model/interface/view-Tree-interfaces';
import { CommonModule } from '@angular/common';
import { treeData } from '../../model/data/treeData';
import { ViewTreeService } from '../../service/ViewTreeService';

@Component({
  selector: 'app-view-tree',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-tree.component.html',
  styleUrl: './view-tree.component.css'
})
export class ViewTreeComponent implements OnDestroy {

  //===============================
  // ===== Constants =====

  private readonly DisplayMode = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3
  } as const;

  //===============================
  // ===== Services =====

  private treeService = inject(ViewTreeService);

  //===============================
  // ===== State Signals =====

  private readonly windowWidth = signal(window.innerWidth);
  private readonly selectedNodeIds = signal<Map<number, number>>(new Map());


  //===============================
  // ===== Derived State (Computed) 

  readonly filteredTreeData = computed(() => this.filterTreeData());

  readonly currentDisplay = computed(() => {
    const nodeLevel = this.getDeepestSelectedNodeLevel();

    if (nodeLevel === 0 || nodeLevel === 1 || nodeLevel === 2)
      return 1;

    if (nodeLevel === 3 || nodeLevel === 4)
      return 2;

    if (nodeLevel === 5 || nodeLevel === 6)
      return 3;

    return 1; // default fallback
  });

  readonly selectedNodes = computed(() => this.selectedNodeIds());


  //===============================
  // ===== Lifecycle =====

  constructor() {
    window.addEventListener('resize', this.handleResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.windowWidth.set(window.innerWidth);
  };



  //===============================
  // ===== User Interactions =====
  //===============================

onNodeClick(node: ITreeNode): void {

  const hasChildren: boolean = this.hasChildren(node.id);

  if (!hasChildren) {
    console.warn('Node has no children, cannot be selected:', node);
    return;
  } 


  if (node.level !== undefined && node.level !== 0 && hasChildren) {  // ✅ CORRECT
    this.selectNode(node.level, node.id);
  } else {
    console.warn('Cannot select parent node or node without level:', node);
    return;
  }
}


private hasChildren(nodeId: number): boolean {
  return treeData.some(n => n.parentId === nodeId);
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
  //====== Data Filtering =========
  //===============================


  private filterTreeData(): ITreeNodesGroup[] {
    let nodesGroupList: ITreeNodesGroup[] = [];
    const selectedMap = this.selectedNodeIds();
    let display = this.getDeepestSelectedNodeLevel();
    if(display === -1) display = 1;

    console.log("    const display = this.getDeepestSelectedNodeLevel" + display)
    // L0 - Root (always shown)
    const l0NodeGroup = this.treeService.getRoot(treeData);
    if (!l0NodeGroup) return nodesGroupList;

    nodesGroupList.push(l0NodeGroup);

    // L1 - Root children (always shown)
    const l1NodeGroup = this.treeService.getChildren(
      treeData,
      l0NodeGroup.nodeList[0]?.id || 0
    );

    if (l1NodeGroup) {
      nodesGroupList.push(l1NodeGroup);
    }

    // L2 - Children of selected L1
    const selectedL1Id = selectedMap.get(1);
    if (selectedL1Id) {
      const l2NodeGroup = this.treeService.getChildren(treeData, selectedL1Id);
      if (l2NodeGroup) nodesGroupList.push(l2NodeGroup);
    }

    // L3 - Children of selected L2
    const selectedL2Id = selectedMap.get(2);
    if (selectedL2Id) {
      const l3NodeGroup = this.treeService.getChildren(treeData, selectedL2Id);
      if (l3NodeGroup) nodesGroupList.push(l3NodeGroup);
    }

    // L4 - Children of selected L3
    const selectedL3Id = selectedMap.get(3);
    if (selectedL3Id) {
      const l4NodeGroup = this.treeService.getChildren(treeData, selectedL3Id);
      if (l4NodeGroup) nodesGroupList.push(l4NodeGroup);
    }

    // L5 - Children of selected L4
    const selectedL4Id = selectedMap.get(4);
    if (selectedL4Id) {
      const l5NodeGroup = this.treeService.getChildren(treeData, selectedL4Id);
      if (l5NodeGroup) nodesGroupList.push(l5NodeGroup);
    }

    // L6 - Children of selected L5
    const selectedL5Id = selectedMap.get(5);
    if (selectedL5Id) {
      const l6NodeGroup = this.treeService.getChildren(treeData, selectedL5Id);
      if (l6NodeGroup) nodesGroupList.push(l6NodeGroup);
    }



    // add layout to List of group of node
    nodesGroupList = this.addLayoutToCurrentGroups(nodesGroupList, display)

    return nodesGroupList;
  }

  // ========================================

  addLayoutToCurrentGroups(nodeGroupsList: ITreeNodesGroup[], display: number): ITreeNodesGroup[] {

    let completedNodeGroupList: ITreeNodesGroup[] = [];

    for (let groupIndex = 0; groupIndex < nodeGroupsList.length; groupIndex++) {

      const nodeGroup = nodeGroupsList[groupIndex];
      let currentGroupLevel = nodeGroup.level
      let completedNodeGroup: ITreeNodesGroup = {
        level: 1,
        nodeList: []

      }

      console.log("currentGroupLevel = " +  currentGroupLevel )

      if (currentGroupLevel === 0) {
        completedNodeGroup = this.treeService.addL0NodeLayout2(nodeGroup, display)

      } 
      
      if (currentGroupLevel === 1 || currentGroupLevel === 2) {
        completedNodeGroup = this.treeService.addL1L2NodeLayout2(nodeGroup, display)

      } 
      
      if (currentGroupLevel === 3 || currentGroupLevel === 4) {
        completedNodeGroup = this.treeService.addL3L4NodeLayout2(nodeGroup, display)

      } 
      
      if (currentGroupLevel === 5 || currentGroupLevel === 6) {
        completedNodeGroup = this.treeService.addL5L6NodeLayout2(nodeGroup, display)

      }

      completedNodeGroupList.push(completedNodeGroup);


    }

    return completedNodeGroupList;
  }




  //===============================
  //========== Styling ============
  //===============================


  getNodeStyle(node: ITreeNode): Record<string, any> {
  
    let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }    
    if(node.layout){
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
    if (level === undefined || level === 0) return false;

    return true;
  }
  //===============================
  // ======= Helper Methods =======
  //===============================


  clearAllSelections(): void {
    this.selectedNodeIds.set(new Map());
  }




 private getDeepestSelectedNodeLevel(): number {
  const map = this.selectedNodeIds();
  
  if (map.size === 0) return 1; // Default to display 1 when nothing is selected
  
  const highestLevel = Math.max(...map.keys());
  
  
  if (highestLevel === 0 || highestLevel === 1) return 1;
  if (highestLevel === 2 || highestLevel === 3) return 2;
  if (highestLevel === 4 || highestLevel === 5) return 3;
  
  return 1; // Fallback to display 1
}

}


