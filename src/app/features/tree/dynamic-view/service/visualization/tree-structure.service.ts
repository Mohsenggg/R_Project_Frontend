import { Injectable } from "@angular/core";
import { ITreeNode, ITreeNodesGroup } from "../../model/interface/view-Tree-interfaces";

@Injectable({ providedIn: 'root' })
export class TreeStructureService {

      getRoot(treeData: ITreeNode[]): ITreeNodesGroup | undefined {
            const rootNode = treeData.find(n => n.parentId === 0);

            if (!rootNode) return undefined;

            return {
                  level: rootNode.level,
                  nodeList: [rootNode]
            };
      }

      getChildren(treeData: ITreeNode[], parentId: number): ITreeNodesGroup | undefined {
            const children = treeData.filter(n => n.parentId === parentId);

            if (children.length === 0) return undefined;

            return {
                  level: children[0].level,
                  nodeList: children
            };
      }

      /**
       * Filters and collects all visible node groups based on the current selection state.
       */
      getVisibleNodeGroups(nodes: ITreeNode[], selectedMap: Map<number, number>): ITreeNodesGroup[] {
            let nodesGroupList: ITreeNodesGroup[] = [];

            if (nodes.length === 0) return [];

            // L0 - Root (always shown)
            const l0NodeGroup = this.getRoot(nodes);
            if (!l0NodeGroup) return nodesGroupList;

            nodesGroupList.push(l0NodeGroup);

            // L1 - Root children (always shown)
            const l1NodeGroup = this.getChildren(
                  nodes,
                  l0NodeGroup.nodeList[0]?.id || 0
            );

            if (l1NodeGroup) {
                  nodesGroupList.push(l1NodeGroup);
            }

            // L2 - Children of selected L1
            const selectedL1Id = selectedMap.get(1);
            if (selectedL1Id) {
                  const l2NodeGroup = this.getChildren(nodes, selectedL1Id);
                  if (l2NodeGroup) nodesGroupList.push(l2NodeGroup);
            }

            // L3 - Children of selected L2
            const selectedL2Id = selectedMap.get(2);
            if (selectedL2Id) {
                  const l3NodeGroup = this.getChildren(nodes, selectedL2Id);
                  if (l3NodeGroup) nodesGroupList.push(l3NodeGroup);
            }

            // L4 - Children of selected L3
            const selectedL3Id = selectedMap.get(3);
            if (selectedL3Id) {
                  const l4NodeGroup = this.getChildren(nodes, selectedL3Id);
                  if (l4NodeGroup) nodesGroupList.push(l4NodeGroup);
            }

            // L5 - Children of selected L4
            const selectedL4Id = selectedMap.get(4);
            if (selectedL4Id) {
                  const l5NodeGroup = this.getChildren(nodes, selectedL4Id);
                  if (l5NodeGroup) nodesGroupList.push(l5NodeGroup);
            }

            // L6 - Children of selected L5
            const selectedL5Id = selectedMap.get(5);
            if (selectedL5Id) {
                  const l6NodeGroup = this.getChildren(nodes, selectedL5Id);
                  if (l6NodeGroup) nodesGroupList.push(l6NodeGroup);
            }

            return nodesGroupList;
      }
}
