import { TreeItem } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {Message }from "@inngest/agent-kit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a record of files to a tree structure.
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 * 
 * @example 
 * Input: { "src/Button.tsx": "...", "Readme.md" : "..."}
 * Ouput: [["src", "Button.tsx"], "README.md"]
 */
export function convertFilesToTreeItems(
  files: { [path: string] : string},
): TreeItem[] {
  interface TreeNode {
    [key: string]: TreeNode | null;
  };

  const tree: TreeNode = {};

  const sortedPaths = Object.keys(files).sort();

  for (const filePath of sortedPaths) {
    const parts = filePath.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const fileName = parts[parts.length - 1]; //file is at the end of path
    current[fileName] = null;
  }

  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node);
    
    if (entries.length ===0) {
      return name || "";
    }

    const children:TreeItem[] = [];

    for (const [key, value] of entries) {
      if (value === null) {
        //is a file
        children.push(key);
      } else {
        //a folder
        const subTree = convertNode(value, key);
        if (Array.isArray(subTree)) {
          children.push([key, ...subTree])
        } else {
          children.push([key, subTree])
        }
      }
    }
    return children;

  }

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
};

export const parseAgentOutput = (value: Message[]) => {
      const output = value[0];
      if (output.type !== "text") {
        return "Here ya go.";
      }

      if (Array.isArray(output.content)) {
        return output.content.map((txt) => txt).join("")
      } else {
        return output.content
      }
    };
