import { Injectable } from "@angular/core";
import { IDisplayRatios, INodeLayout, ITreeNode, ITreeNodesGroup } from "../model/interface/view-Tree-interfaces";

@Injectable({ providedIn: 'root' })
export class ViewTreeService {

      // ====================================================
      // ====  Prepare Nodes ================================
      // ====================================================

      getRoot(treeData: ITreeNode[]): ITreeNodesGroup | undefined {
            const rootNode = treeData.find(n => n.parentId === 0);

            if (!rootNode) return undefined;

            return {
                  level: rootNode.level,
                  nodeList: [rootNode] // Only root node in array
            };
      }

      getChildren(treeData: ITreeNode[], parentId: number): ITreeNodesGroup | undefined {
            const children = treeData.filter(n => n.parentId === parentId);

            if (children.length === 0) return undefined;

            return {
                  level: children[0].level, // All children at same level
                  nodeList: children
            };
      }

      // ====================================================
      // ==== Prepare Nodes Styles ==========================
      // ====================================================

      addL0NodeLayout(nodeGroup: ITreeNodesGroup, display: number, windowDims: { width: number, height: number }): ITreeNodesGroup {
            let node: ITreeNode = nodeGroup.nodeList[0];
            const groupLevel = node.level;
            let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 };

            const displayRatios = this.getGroupOneLayout(display, groupLevel, windowDims);

            const leftPositionL0 = (windowDims.width / 2) - (displayRatios.nodeWidth / 2);
            nodeLayout.nodeHeight = displayRatios.nodeHeight;
            nodeLayout.nodeWidth = displayRatios.nodeWidth;
            nodeLayout.leftSpaceX = leftPositionL0;
            nodeLayout.topSpaceY = displayRatios.topSpaceY;

            node.layout = nodeLayout;
            nodeGroup.nodeList[0] = node;

            return nodeGroup;
      }

      addL1L2NodeLayout(nodeGroup: ITreeNodesGroup, display: number, windowDims: { width: number, height: number }): ITreeNodesGroup {
            const groupLevel = nodeGroup.level;
            const nodeList = nodeGroup.nodeList;

            if (nodeList.length === 0) {
                  console.warn(`nodeGroup Length ` + nodeList.length);
                  return nodeGroup;
            }

            if (groupLevel !== 1 && groupLevel !== 2) {
                  console.warn(`Level ${groupLevel} not supported in addL1L2NodeLayout`);
                  return nodeGroup;
            }

            const displayRatios = this.getGroupOneLayout(display, groupLevel, windowDims);

            // Calculate total width using correct gaps
            const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);
            const startX = Math.max(0, (windowDims.width - totalWidth) / 2);

            for (let i = 0; i < nodeList.length; i++) {
                  let node: ITreeNode = nodeList[i];
                  let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 };

                  nodeLayout.nodeHeight = displayRatios.nodeHeight;
                  nodeLayout.nodeWidth = displayRatios.nodeWidth;
                  nodeLayout.topSpaceY = displayRatios.topSpaceY;

                  let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap);
                  nodeLayout.leftSpaceX = leftSpace;

                  node.layout = nodeLayout;
            }

            nodeGroup.nodeList = nodeList;
            return nodeGroup;
      }

      addL3L4NodeLayout(nodeGroup: ITreeNodesGroup, display: number, windowDims: { width: number, height: number }): ITreeNodesGroup {
            const groupLevel = nodeGroup.level;
            const nodeList = nodeGroup.nodeList;

            if (nodeList.length === 0) {
                  console.warn(`nodeGroup Length ` + nodeList.length);
                  return nodeGroup;
            }

            if (groupLevel !== 3 && groupLevel !== 4) {
                  console.warn(`Level ${groupLevel} not supported in addL3L4NodeLayout`);
                  return nodeGroup;
            }

            const displayRatios = this.getGroupTwoLayout(display, groupLevel, windowDims);
            const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);
            const startX = Math.max(0, (windowDims.width - totalWidth) / 2);

            for (let i = 0; i < nodeList.length; i++) {
                  let node: ITreeNode = nodeList[i];
                  let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 };

                  nodeLayout.nodeHeight = displayRatios.nodeHeight;
                  nodeLayout.nodeWidth = displayRatios.nodeWidth;
                  nodeLayout.topSpaceY = displayRatios.topSpaceY;

                  let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap);
                  nodeLayout.leftSpaceX = leftSpace;

                  node.layout = nodeLayout;
            }

            nodeGroup.nodeList = nodeList;
            return nodeGroup;
      }

      addL5L6NodeLayout(nodeGroup: ITreeNodesGroup, display: number, windowDims: { width: number, height: number }): ITreeNodesGroup {
            const groupLevel = nodeGroup.level;
            const nodeList = nodeGroup.nodeList;

            if (nodeList.length === 0) {
                  console.warn(`nodeGroup Length ` + nodeList.length);
                  return nodeGroup;
            }

            if (groupLevel !== 5 && groupLevel !== 6) {
                  console.warn(`Level ${groupLevel} not supported in addL5L6NodeLayout`);
                  return nodeGroup;
            }

            const displayRatios = this.getGroupThreeLayout(display, groupLevel, windowDims);
            const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);
            const startX = Math.max(0, (windowDims.width - totalWidth) / 2);

            for (let i = 0; i < nodeList.length; i++) {
                  let node: ITreeNode = nodeList[i];
                  let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 };

                  nodeLayout.nodeHeight = displayRatios.nodeHeight;
                  nodeLayout.nodeWidth = displayRatios.nodeWidth;
                  nodeLayout.topSpaceY = displayRatios.topSpaceY;

                  let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap);
                  nodeLayout.leftSpaceX = leftSpace;

                  node.layout = nodeLayout;
            }

            nodeGroup.nodeList = nodeList;
            return nodeGroup;
      }

      //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      getGroupOneLayout(display: number, groupLevel: number, windowDims: { width: number, height: number }): IDisplayRatios {
            let displayRatios: IDisplayRatios = {
                  nodeWidth: 0,
                  nodeHeight: 0,
                  leftSpaceX: 0,
                  topSpaceY: 0,
                  gap: 0
            };

            let width = windowDims.width * 0.12;
            let height = windowDims.height * 0.17;
            height = Math.min(height, width * 0.75);

            let gap = width * 0.17;
            gap = Math.max(gap, windowDims.width * 0.015);

            let topSpaceY = 0;

            if (groupLevel === 0) {
                  topSpaceY = windowDims.height * 0.05;
            } else if (groupLevel === 1) {
                  topSpaceY = windowDims.height * 0.33;
            } else if (groupLevel === 2) {
                  topSpaceY = windowDims.height * 0.62;
            }

            if (display === 1) {
                  displayRatios.nodeHeight = height;
                  displayRatios.nodeWidth = width;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;
                  displayRatios.topSpaceY = topSpaceY;

            } else if (display === 2) {
                  displayRatios.nodeHeight = height * 0.7;
                  displayRatios.nodeWidth = width * 0.7;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;

                  if (groupLevel === 0) {
                        topSpaceY = windowDims.height * 0.025;
                  } else if (groupLevel === 1) {
                        topSpaceY = windowDims.height * 0.18;
                  } else if (groupLevel === 2) {
                        topSpaceY = windowDims.height * 0.35;
                  }

                  displayRatios.topSpaceY = topSpaceY;

            } else if (display === 3) {
                  displayRatios.nodeHeight = height * 0.55;
                  displayRatios.nodeWidth = width * 0.55;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;
                  displayRatios.topSpaceY = topSpaceY * 0.45;
            }

            return displayRatios;
      }


      getGroupTwoLayout(display: number, groupLevel: number, windowDims: { width: number, height: number }): IDisplayRatios {
            let displayRatios: IDisplayRatios = {
                  nodeWidth: 0,
                  nodeHeight: 0,
                  leftSpaceX: 0,
                  topSpaceY: 0,
                  gap: 0
            };

            let width = windowDims.width * 0.11;
            let height = windowDims.height * 0.16;
            height = Math.min(height, width * 0.75);

            let gap = width * 0.25;
            gap = Math.max(gap, windowDims.width * 0.015);

            let topSpaceY = 0;
            if (groupLevel === 3) {
                  topSpaceY = windowDims.height * 0.57;
            } else if (groupLevel === 4) {
                  topSpaceY = windowDims.height * 0.815;
            }

            if (display === 2) {
                  displayRatios.nodeHeight = height;
                  displayRatios.nodeWidth = width;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;
                  displayRatios.topSpaceY = topSpaceY;

            } else if (display === 3) {
                  displayRatios.nodeHeight = height * 0.7;
                  displayRatios.nodeWidth = width * 0.7;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;

                  if (groupLevel === 3) {
                        topSpaceY = windowDims.height * 0.42;
                  } else if (groupLevel === 4) {
                        topSpaceY = windowDims.height * 0.56;
                  }
                  displayRatios.topSpaceY = topSpaceY;
            }

            return displayRatios;
      }

      getGroupThreeLayout(display: number, groupLevel: number, windowDims: { width: number, height: number }): IDisplayRatios {
            let displayRatios: IDisplayRatios = {
                  nodeWidth: 0,
                  nodeHeight: 0,
                  leftSpaceX: 0,
                  topSpaceY: 0,
                  gap: 0
            };

            if (display === 3) {
                  let width = windowDims.width * 0.11;
                  let height = windowDims.height * 0.14;
                  height = Math.min(height, width * 0.75);

                  let gap = width * 0.25;
                  gap = Math.max(gap, windowDims.width * 0.015);

                  let topSpaceY = 0;
                  if (groupLevel === 5) {
                        topSpaceY = windowDims.height * 0.70;
                  } else if (groupLevel === 6) {
                        topSpaceY = windowDims.height * 0.85;
                  }

                  displayRatios.nodeHeight = height;
                  displayRatios.nodeWidth = width;
                  displayRatios.leftSpaceX = 1;
                  displayRatios.gap = gap;
                  displayRatios.topSpaceY = topSpaceY;
            }

            return displayRatios;
      }

}