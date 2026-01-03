export interface TreeNode {
      id: number | string;
      name: string;
      level?: number;
      children?: TreeNode[];
      _children?: TreeNode[]; // For hidden children (collapsed state)

      // Optional visuals
      color?: string;
      icon?: string;
}

export interface TreeLayoutDimensions {
      width: number;
      height: number;
      margin: { top: number, right: number, bottom: number, left: number };
}
