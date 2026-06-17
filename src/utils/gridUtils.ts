/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Direction, TileState } from "../types";

export const DIRECTIONS: Direction[] = ["up", "right", "down", "left"];

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

/**
 * Computes the absolute, rotated ports based on initial standard zero-rotated ports.
 */
export function getAbsolutePorts(initialPorts: Direction[], rotation: number): Direction[] {
  const shift = Math.floor(rotation / 90) % 4;
  return initialPorts.map((p) => {
    const idx = DIRECTIONS.indexOf(p);
    const newIdx = (idx + shift) % 4;
    return DIRECTIONS[newIdx];
  });
}

/**
 * Given a current board state, executes a BFS starting from 'source' tiles to trace
 * connected circuits. A connection is established if neighbor tile ports align and
 * point directly back at each other.
 */
export function propagateCoherence(board: TileState[][]): {
  energizedIds: Set<string>;
  laserPaths: { from: string; to: string; direction: Direction }[];
} {
  const energizedIds = new Set<string>();
  const laserPaths: { from: string; to: string; direction: Direction }[] = [];
  const queue: TileState[] = [];

  const height = board.length;
  if (height === 0) return { energizedIds, laserPaths };
  const width = board[0].length;

  // 1. Locate all source nodes and push them to sequence
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = board[y][x];
      if (tile.type === "source") {
        queue.push(tile);
        energizedIds.add(tile.id);
      }
    }
  }

  // Helper to find tile by coordinate
  const getTile = (tx: number, ty: number): TileState | null => {
    if (ty >= 0 && ty < height && tx >= 0 && tx < width) {
      return board[ty][tx];
    }
    return null;
  };

  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const currentPorts = getAbsolutePorts(current.initialPorts, current.rotation);

    for (const port of currentPorts) {
      let nx = current.x;
      let ny = current.y;

      if (port === "up") ny -= 1;
      else if (port === "right") nx += 1;
      else if (port === "down") ny += 1;
      else if (port === "left") nx -= 1;

      const neighbor = getTile(nx, ny);
      if (!neighbor || neighbor.type === "empty" || neighbor.type === "obstacle") continue;

      const neighborPorts = getAbsolutePorts(neighbor.initialPorts, neighbor.rotation);
      const expectedOpposite = OPPOSITE_DIRECTIONS[port];

      // A link is valid if neighboring node has a port pointing back to current emitter
      if (neighborPorts.includes(expectedOpposite)) {
        if (!energizedIds.has(neighbor.id)) {
          energizedIds.add(neighbor.id);
          queue.push(neighbor);
        }
        laserPaths.push({
          from: current.id,
          to: neighbor.id,
          direction: port,
        });
      }
    }
  }

  return { energizedIds, laserPaths };
}
