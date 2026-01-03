import { TreeNode } from "../models/tree.types";

export const MOCK_TREE_DATA: TreeNode = {
      id: "root",
      name: "Root Level 0",
      level: 0,
      children: [
            {
                  id: "1-1",
                  name: "Protector L1",
                  level: 1,
                  children: [
                        {
                              id: "2-1",
                              name: "Section A",
                              level: 2,
                              children: generateChildren(3, 3, "2-1")
                        },
                        {
                              id: "2-2",
                              name: "Section B",
                              level: 2,
                              children: generateChildren(3, 2, "2-2")
                        }
                  ]
            },
            {
                  id: "1-2",
                  name: "Warrior L1",
                  level: 1,
                  children: [
                        {
                              id: "2-3",
                              name: "Section C",
                              level: 2,
                              children: generateChildren(3, 3, "2-3")
                        }
                  ]
            }
      ]
};

function generateChildren(startLevel: number, count: number, parentId: string): TreeNode[] {
      if (startLevel > 8) return [];

      const nodes: TreeNode[] = [];
      for (let i = 1; i <= count; i++) {
            const id = `${parentId}-${i}`;
            nodes.push({
                  id: id,
                  name: `Node L${startLevel}-${i}`,
                  level: startLevel,
                  children: Math.random() > 0.3 ? generateChildren(startLevel + 1, Math.floor(Math.random() * 3), id) : []
            });
      }
      return nodes;
}
