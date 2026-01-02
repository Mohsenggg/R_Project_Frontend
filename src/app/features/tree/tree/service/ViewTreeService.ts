import { Injectable, signal } from "@angular/core";
import { IDisplayRatios, INodeLayout, ITreeNode, ITreeNodesGroup } from "../model/interface/view-Tree-interfaces";

@Injectable({ providedIn: 'root' })
export class ViewTreeService {


  private readonly windowWidth = signal(window.innerWidth);

  private readonly windowHeight = signal(window.innerHeight);


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


  addL0NodeLayout(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    let node: ITreeNode = nodeGroup.nodeList[0]
    let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }
    // level height is changed based on the display

    const groupHeightFactor = this.getGroupOneHeight(display);

    console.log("const groupHeightFactor = this.getGroupOneHeigth(display) " + groupHeightFactor)

    let nodeRelativeHeight = (this.windowHeight() * 0.14) * groupHeightFactor;
    const nodeRelativeWidth = (this.windowWidth() * 0.11) * groupHeightFactor;
    nodeRelativeHeight = Math.min(nodeRelativeHeight, nodeRelativeWidth * 0.75);

    const leftPositionL0 = (this.windowWidth() / 2) - (nodeRelativeWidth / 2);
    nodeLayout.nodeHeight = nodeRelativeHeight;
    nodeLayout.nodeWidth = nodeRelativeWidth;
    nodeLayout.leftSpaceX = leftPositionL0;
    nodeLayout.topSpaceY = this.windowHeight() * 0.02;

    node.layout = nodeLayout;

    nodeGroup.nodeList[0] = node;

    return nodeGroup;
  }

  // -------------------------------------------------

  addL1L2NodeLayout(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 1 && groupLevel !== 2) {
      console.warn(`Level ${groupLevel} not supported in addL1L2NodeLayout`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const groupHeightFactor = this.getGroupOneHeight(display);

    // prepare node diamensions --------------------------------------------------
    let nodeRelativeHeight = (this.windowHeight() * 0.14) * groupHeightFactor;
    const nodeRelativeWidth = (this.windowWidth() * 0.11) * groupHeightFactor;
    nodeRelativeHeight = Math.min(nodeRelativeHeight, nodeRelativeWidth * 0.75);


    // to adjust inner spaces --------------------------------------------
    let gap = nodeRelativeWidth * 0.25;
    gap = Math.max(gap, this.windowWidth() * 0.015);

    const totalWidth = (nodeList.length * nodeRelativeWidth) + ((nodeList.length - 1) * gap);
    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);


    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = nodeRelativeHeight;
      console.log("nodeRelativeHeight = " + nodeRelativeHeight)
      nodeLayout.nodeWidth = nodeRelativeWidth;
      console.log("nodeRelativeWidth = " + nodeRelativeWidth)
      let leftSpace = startX + i * (nodeRelativeWidth + gap)
      nodeLayout.leftSpaceX = leftSpace;
      console.log("leftSpace = " + leftSpace)
      // top margin based on the node level ------------
      if (groupLevel === 1) {
        nodeLayout.topSpaceY = (this.windowHeight() * 0.3) * groupHeightFactor;
        console.log("topSpaceY = " + nodeLayout.topSpaceY)
      } else if (groupLevel === 2) {
        nodeLayout.topSpaceY = (this.windowHeight() * 0.55) * groupHeightFactor;
        console.log("topSpaceY = " + nodeLayout.topSpaceY)
      }

      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }




  // -------------------------------------------------

  addL3L4NodeLayout(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 3 && groupLevel !== 4) {
      console.warn(`Level ${groupLevel} not supported in addL1L2NodeLayout`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const groupHeightFactor = this.getGroupTwoHeigth(display);

    // prepare node diamensions --------------------------------------------------
    let nodeRelativeHeight = (this.windowHeight() * 0.12) * groupHeightFactor;
    const nodeRelativeWidth = (this.windowWidth() * 0.072) * groupHeightFactor;
    nodeRelativeHeight = Math.min(nodeRelativeHeight, nodeRelativeWidth * 0.75);


    // to adjust inner spaces --------------------------------------------
    const gap = nodeRelativeWidth * 0.25;
    const totalWidth = (nodeList.length * nodeRelativeWidth) + ((nodeList.length - 1) * gap);
    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);


    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = nodeRelativeHeight;
      nodeLayout.nodeWidth = nodeRelativeWidth;
      let leftSpace = startX + i * (nodeRelativeWidth + gap)
      nodeLayout.leftSpaceX = leftSpace;


      // top margin based on the node level ------------
      if (groupLevel === 3) {
        nodeLayout.topSpaceY = (this.windowHeight() * 0.52) * groupHeightFactor;
      } else if (groupLevel === 4) {
        nodeLayout.topSpaceY = (this.windowHeight() * 0.7) * groupHeightFactor;
      }

      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }


  // -------------------------------------------------

  addL5L6NodeLayout(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 5 && groupLevel !== 6) {
      console.warn(`Level ${groupLevel} not supported in addL1L2NodeLayout`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const groupHeightFactor = 1;

    // prepare node diamensions --------------------------------------------------
    let nodeRelativeHeight = (this.windowHeight() * 0.12) * groupHeightFactor;
    const nodeRelativeWidth = (this.windowWidth() * 0.072) * groupHeightFactor;
    nodeRelativeHeight = Math.min(nodeRelativeHeight, nodeRelativeWidth * 0.75);


    // to adjust inner spaces --------------------------------------------
    let gap = nodeRelativeWidth * 0.25;
    gap = Math.min(gap, this.windowWidth() * 0.1);

    const totalWidth = (nodeList.length * nodeRelativeWidth) + ((nodeList.length - 1) * gap);
    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);


    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = nodeRelativeHeight;
      nodeLayout.nodeWidth = nodeRelativeWidth;
      let leftSpace = startX + i * (nodeRelativeWidth + gap)
      nodeLayout.leftSpaceX = leftSpace;

      // top margin based on the node level ------------
      if (groupLevel === 5) {
        nodeLayout.topSpaceY = this.windowHeight() * 0.58;
      } else if (groupLevel === 6) {
        nodeLayout.topSpaceY = this.windowHeight() * 0.8;
      }

      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }


  // ==========================================================
  // group one {L0, L1, L2}



  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



  addL0NodeLayout2(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {


    let node: ITreeNode = nodeGroup.nodeList[0]
      const groupLevel = node.level;

    let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }
    // level height is changed based on the display



    const displayRatios = this.getGroupOneLayout(display, groupLevel);




    const leftPositionL0 = (this.windowWidth() / 2) - (displayRatios.nodeWidth / 2);
    nodeLayout.nodeHeight = displayRatios.nodeHeight;
    nodeLayout.nodeWidth = displayRatios.nodeWidth;
    nodeLayout.leftSpaceX = leftPositionL0;
    nodeLayout.topSpaceY = displayRatios.topSpaceY;

    node.layout = nodeLayout;

    nodeGroup.nodeList[0] = node;

    return nodeGroup;
  }



  addL1L2NodeLayout2(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 1 && groupLevel !== 2) {
      console.warn(`Level ${groupLevel} not supported in addL1L2NodeLayout`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const displayRatios = this.getGroupOneLayout(display, groupLevel);
    const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);

    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);



    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = displayRatios.nodeHeight;
      nodeLayout.nodeWidth = displayRatios.nodeWidth;
      nodeLayout.topSpaceY = displayRatios.topSpaceY;

      let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap)
      nodeLayout.leftSpaceX = leftSpace;
      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }


  addL3L4NodeLayout2(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 3 && groupLevel !== 4) {
      console.warn(`Level ${groupLevel} not supported in addL3L4NodeLayout2`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const displayRatios = this.getGroupTwoLayout(display, groupLevel);
    const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);

    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);



    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = displayRatios.nodeHeight;
      nodeLayout.nodeWidth = displayRatios.nodeWidth;
      nodeLayout.topSpaceY = displayRatios.topSpaceY;

      let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap)
      nodeLayout.leftSpaceX = leftSpace;
      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }


  addL5L6NodeLayout2(nodeGroup: ITreeNodesGroup, display: number): ITreeNodesGroup {

    const groupLevel = nodeGroup.level;
    const nodeList = nodeGroup.nodeList;

    // validation --------------------------------------------------------
    if (nodeList.length === 0) {
      console.warn(`nodeGroup Length ` + nodeList.length);
      return nodeGroup;
    }

    if (groupLevel !== 5 && groupLevel !== 6) {
      console.warn(`Level ${groupLevel} not supported in addL5L6NodeLayout2`);
      return nodeGroup;
    }

    // level height is changed based on the display ---------------------
    const displayRatios = this.getGroupThreeLayout(display, groupLevel);
    const totalWidth = (nodeList.length * displayRatios.nodeWidth) + ((nodeList.length - 1) * displayRatios.gap);

    const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);



    // add layout to each node -------------------------------------------
    for (let i = 0; i < nodeList.length; i++) {

      let node: ITreeNode = nodeList[i]
      let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }

      // -----------------------------------------------
      nodeLayout.nodeHeight = displayRatios.nodeHeight;
      nodeLayout.nodeWidth = displayRatios.nodeWidth;
      nodeLayout.topSpaceY = displayRatios.topSpaceY;

      let leftSpace = startX + i * (displayRatios.nodeWidth + displayRatios.gap)
      nodeLayout.leftSpaceX = leftSpace;
      // ------------------------------------------------
      node.layout = nodeLayout;

    }

    // --------------------------------------------------
    nodeGroup.nodeList = nodeList;

    return nodeGroup;
  }





  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  getGroupOneLayout(display: number, groupLevel: number): IDisplayRatios {

    let displayRatios: IDisplayRatios = {
      nodeWidth: 0,
      nodeHeight: 0,
      leftSpaceX: 0,
      topSpaceY: 0,
      gap: 0
    }




    let width = this.windowWidth() * 0.12;
    let height = this.windowHeight() * 0.17;
    height = Math.min(height, width * 0.75);

    let gap = width * 0.17;
    gap = Math.max(gap, this.windowWidth() * 0.015);

    let topSpaceY = 0;

    if (groupLevel === 0) {
      topSpaceY = this.windowHeight() * 0.05;
    } else if (groupLevel === 1) {
      topSpaceY = this.windowHeight() * 0.33;
    } else if (groupLevel === 2) {
      topSpaceY = this.windowHeight() * 0.62;
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
      topSpaceY = this.windowHeight() * 0.025;
    } else if (groupLevel === 1) {
      topSpaceY = this.windowHeight() * 0.18;
    } else if (groupLevel === 2) {
      topSpaceY = this.windowHeight() * 0.35;
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

  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  getGroupTwoLayout(display: number, groupLevel: number): IDisplayRatios {

    let displayRatios: IDisplayRatios = {
      nodeWidth: 0,
      nodeHeight: 0,
      leftSpaceX: 0,
      topSpaceY: 0,
      gap: 0
    }

    let width = this.windowWidth() * 0.11;
    let height = this.windowHeight() * 0.16;
    height = Math.min(height, width * 0.75);

    let gap = width * 0.25;
    gap = Math.max(gap, this.windowWidth() * 0.015);

    let topSpaceY = 0;
    if (groupLevel === 3) {
      topSpaceY = this.windowHeight() * 0.57;
    } else if (groupLevel === 4) {
      topSpaceY = this.windowHeight() * 0.815;
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
        topSpaceY = this.windowHeight() * 0.42;
      } else if (groupLevel === 4) {
        topSpaceY = this.windowHeight() * 0.56;
      }
      displayRatios.topSpaceY = topSpaceY;



    }

    return displayRatios;
  }


  getGroupThreeLayout(display: number, groupLevel: number): IDisplayRatios {

    let displayRatios: IDisplayRatios = {
      nodeWidth: 0,
      nodeHeight: 0,
      leftSpaceX: 0,
      topSpaceY: 0,
      gap: 0
    }


    if (display === 3) {

      let width = this.windowWidth() * 0.11;
      let height = this.windowHeight() * 0.14;
      height = Math.min(height, width * 0.75);

      let gap = width * 0.25;
      gap = Math.max(gap, this.windowWidth() * 0.015);

      let topSpaceY = 0;
      if (groupLevel === 5) {
        topSpaceY = this.windowHeight() * 0.76;
      } else if (groupLevel === 6) {
        topSpaceY = this.windowHeight() * 0.99;
      }


      displayRatios.nodeHeight = height;
      displayRatios.nodeWidth = width;
      displayRatios.leftSpaceX = 1;
      displayRatios.gap = gap;
      displayRatios.topSpaceY = topSpaceY;


    }

    return displayRatios;
  }


  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++




  // group one {L0, L1, L2}
  getGroupOneHeight(display: number): number {

    let size = 0;

    if (display === 1) {
      size = 1

    } else if (display === 2) {
      size = 0.6

    } else if (display === 3) {
      size = 0.4

    }

    return size;
  }

  // group one {L3, L4}
  getGroupTwoHeigth(display: number): number {

    let size = 0;

    if (display === 2) {
      size = 1

    } else if (display === 3) {
      size = 0.7

    }

    return size;

  }



}




// firstDisplayLayout(node: ITreeNode, nodeLayout: INodeLayout, levelLength: number): INodeLayout {
//   const nodeLevel = node.level;

//   if (nodeLevel === 0) {


//     // TODO add display fractoion here
//     const nodeRelativeHieght = this.windowHieght() * 0.12;
//     const nodeRelativeWidth = nodeRelativeHieght * 1.3;

//     const leftPositionL0 = this.windowWidth() / 2;

//     nodeLayout.nodeHeight = nodeRelativeHieght;
//     nodeLayout.nodeWidth = nodeRelativeWidth;
//     nodeLayout.leftSpaceX = leftPositionL0;
//     nodeLayout.topSpaceY = this.windowHieght() * 0.05;




//   } else if (nodeLevel === 1 || nodeLevel === 2) {

//     const nodeRelativeWidth = this.windowWidth() * 0.07;
//     const nodeRelativeHeight = this.windowWidth() * 0.055;


//     const gap = nodeRelativeWidth * 0.3;

//     const totalWidth = (levelLength * nodeRelativeWidth) + ((levelLength - 1) * gap);
//     const startX = Math.max(0, (this.windowWidth() - totalWidth) / 2);


//     let leftPositionL1L2 = 0;
//     console.log("node.nodeLayoutIndex = " + node.nodeLayoutIndex)

//     if (node.nodeLayoutIndex) {
//       leftPositionL1L2 = startX + node.nodeLayoutIndex * (nodeRelativeWidth + gap)
//       console.log("leftPositionL1L2 = " + leftPositionL1L2)

//     }


//     nodeLayout.nodeHeight = nodeRelativeHeight;
//     nodeLayout.nodeWidth = nodeRelativeWidth;
//     nodeLayout.leftSpaceX = leftPositionL1L2;


//     if (nodeLevel === 1) {
//       nodeLayout.topSpaceY = this.windowHieght() * 0.3;
//     } else if (nodeLevel === 2) {
//       nodeLayout.topSpaceY = this.windowHieght() * 0.6;

//     }


//   }

//   return nodeLayout;
// }

// secondDisplayLayout(node: ITreeNode, nodeLayout: INodeLayout): INodeLayout {
//   // L0 node layout

//   // L1,L2 node layout

//   return nodeLayout

// }


// thirdDisplayLayout(node: ITreeNode, nodeLayout: INodeLayout): INodeLayout {
//   // L0 node layout

//   // L1,L2 node layout

//   return nodeLayout

// }