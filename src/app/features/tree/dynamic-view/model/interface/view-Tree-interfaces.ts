import { Signal } from "@angular/core";

export interface ITreeDisplay {

  nodeGroupList: ITreeNodesGroup[];
  currentDisplay: 1 | 2 | 3;

}

export interface ITreeNode {
  id: number;
  parentId: number;
  level: number;
  name: string;
  layout?: INodeLayout
  nodeLayoutIndex?:number
  nodeSizeFraction?:number
}



export interface ITreeNodesGroup {
  level: number;
  nodeList: ITreeNode[];

}

export interface INodeLayout {
  leftSpaceX: number;
  topSpaceY: number;          // Deprecated: use yPercent instead
  // yPercent?: number;   // NEW: Y position as percentage of container (0-100)
  // levelSlotHeight?: number;  // NEW: Height of the level slot as percentage
  nodeWidth: number;
  nodeHeight: number;
}

export interface IDisplayRatios {
  
  nodeWidth: number;
  nodeHeight: number;
  leftSpaceX: number;
  topSpaceY: number;          
  gap:number;
}