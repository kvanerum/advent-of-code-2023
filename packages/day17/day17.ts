import { Direction } from "../../util/direction.ts";
import { P, type Position } from "../../util/position.ts";
import { MinPriorityQueue } from "data-structure-typed";

interface Transition {
  from: string;
  to: string;
  cost: number;
}

interface NextNode {
  to: string;
  cost: number;
}

class State {
  position: Position;
  movesLeft: number;
  inDirection: Direction;

  constructor(position: Position, movesLeft: number, inDirection: Direction) {
    this.position = position;
    this.movesLeft = movesLeft;
    this.inDirection = inDirection;
  }

  public serialize(): string {
    return `${this.position.toString()}-${this.inDirection}-${this.movesLeft}`;
  }
}

const input = await readInput("input.txt");

console.log(calculateShortestPath(createTransitionsPart1(input)));
console.log(calculateShortestPath(createTransitionsPart2(input)));

function calculateShortestPath(transitions: Transition[]): number {
  const startNode = "0,0";
  const visitedNodes = new Map<string, number>([[startNode, 0]]);
  const nodesToVisit = new MinPriorityQueue<NextNode>([], {
    comparator: (a, b) => a.cost - b.cost,
  });
  const transitionsMap = createTransitionsMap(transitions);

  let step = 0;

  updateNodesToVisit(
    nodesToVisit,
    transitionsMap,
    {
      to: startNode,
      cost: 0,
    },
    visitedNodes,
  );
  let nextNode = getNextNode(nodesToVisit);

  while (nextNode !== undefined) {
    if (step % 5000 === 0) {
      console.log(`nodes to check: ${nodesToVisit.size}`);
    }

    visitedNodes.set(nextNode.to, nextNode.cost);
    updateNodesToVisit(nodesToVisit, transitionsMap, nextNode, visitedNodes);
    nextNode = getNextNode(nodesToVisit);
    step++;
  }

  return Math.min(
    ...[...visitedNodes.entries()]
      .filter(([node, _]) =>
        node.startsWith(`${input.length - 1},${input[0].length - 1}`),
      )
      .map(([_, cost]) => cost),
  );
}

function updateNodesToVisit(
  nodesToVisit: MinPriorityQueue<NextNode>,
  transitions: Map<string, Transition[]>,
  currentNode: NextNode,
  visitedNodes: Map<string, number>,
): void {
  const distanceToCurrentNode = visitedNodes.get(currentNode.to) ?? Infinity;
  for (const transition of transitions.get(currentNode.to) ?? []) {
    if (visitedNodes.has(transition.to)) {
      continue;
    }

    const newCost = distanceToCurrentNode + transition.cost;
    const existingCostNode = nodesToVisit
      .filter((e) => e.to === transition.to)
      .poll();

    if (newCost < (existingCostNode?.cost ?? Infinity)) {
      if (existingCostNode !== undefined) {
        nodesToVisit.delete(existingCostNode);
      }
      nodesToVisit.add({
        to: transition.to,
        cost: newCost,
      });
    }
  }

  nodesToVisit.delete(currentNode);
}

function getNextNode(
  nodesToVisit: MinPriorityQueue<NextNode>,
): NextNode | undefined {
  return nodesToVisit.poll();
}

function createTransitionsPart2(map: number[][]): Transition[] {
  const result: Transition[] = [
    {
      from: "0,0",
      to: `4,0-${Direction.SOUTH}-6`,
      cost: map[1][0] + map[2][0] + map[3][0] + map[4][0],
    },
    {
      from: "0,0",
      to: `0,4-${Direction.EAST}-6`,
      cost: map[0][1] + map[0][2] + map[0][3] + map[0][4],
    },
  ];

  for (let row = 0; row < map.length; ++row) {
    for (let column = 0; column < map[0].length; ++column) {
      if (row === 0 && column === 0) {
        continue;
      }
      const currentPosition = P(row, column);

      getAllInputStates(currentPosition, 6).forEach((inputState) => {
        for (const direction of [
          Direction.NORTH,
          Direction.EAST,
          Direction.SOUTH,
          Direction.WEST,
        ]) {
          if (
            inputState.inDirection === direction &&
            inputState.movesLeft > 0
          ) {
            const destination = inputState.position.goInDirection(direction);
            if (!destination.isInBounds(map[0].length, map.length)) {
              continue;
            }
            result.push({
              from: inputState.serialize(),
              to: new State(
                destination,
                inputState.movesLeft - 1,
                direction,
              ).serialize(),
              cost: map[destination.row][destination.column],
            });
          } else if (
            direction !== inputState.inDirection &&
            !isOppositeDirection(direction, inputState.inDirection)
          ) {
            let cost = 0;
            let destination = inputState.position;

            for (let i = 0; i < 4; ++i) {
              destination = destination.goInDirection(direction);
              if (destination.isInBounds(map[0].length, map.length)) {
                cost += map[destination.row][destination.column];
              }
            }

            if (destination.isInBounds(map[0].length, map.length)) {
              result.push({
                from: inputState.serialize(),
                to: new State(destination, 6, direction).serialize(),
                cost,
              });
            }
          }
        }
      });
    }
  }

  return result;
}

function createTransitionsPart1(map: number[][]): Transition[] {
  const result: Transition[] = [
    {
      from: "0,0",
      to: `1,0-${Direction.SOUTH}-2`,
      cost: map[1][0],
    },
    {
      from: "0,0",
      to: `0,1-${Direction.EAST}-2`,
      cost: map[0][1],
    },
  ];

  for (let row = 0; row < map.length; ++row) {
    for (let column = 0; column < map[0].length; ++column) {
      if (row === 0 && column === 0) {
        continue;
      }
      const currentPosition = P(row, column);

      getAllInputStates(currentPosition, 2).forEach((inputState) => {
        for (const direction of [
          Direction.NORTH,
          Direction.EAST,
          Direction.SOUTH,
          Direction.WEST,
        ]) {
          const destination = inputState.position.goInDirection(direction);

          if (
            !destination.isInBounds(map[0].length, map.length) ||
            (inputState.inDirection === direction &&
              inputState.movesLeft === 0) ||
            isOppositeDirection(direction, inputState.inDirection)
          ) {
            continue;
          }

          const newState = new State(
            destination,
            inputState.inDirection === direction ? inputState.movesLeft - 1 : 2,
            direction,
          );

          result.push({
            from: inputState.serialize(),
            to: newState.serialize(),
            cost: map[destination.row][destination.column],
          });
        }
      });
    }
  }

  return result;
}

function createTransitionsMap(
  transitions: Transition[],
): Map<string, Transition[]> {
  const result = new Map();

  for (const t of transitions) {
    let a = result.get(t.from);
    if (a === undefined) {
      a = [];
      result.set(t.from, a);
    }
    a.push(t);
  }

  return result;
}

function getAllInputStates(
  position: Position,
  defaultMovesLeft: number,
): State[] {
  const result: State[] = [];
  [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST].forEach(
    (direction) => {
      for (let movesLeft = defaultMovesLeft; movesLeft >= 0; movesLeft--) {
        result.push(new State(position, movesLeft, direction));
      }
    },
  );

  return result;
}

function isOppositeDirection(
  direction1: Direction,
  direction2: Direction,
): boolean {
  switch (direction1) {
    case Direction.NORTH:
      return direction2 === Direction.SOUTH;
    case Direction.EAST:
      return direction2 === Direction.WEST;
    case Direction.SOUTH:
      return direction2 === Direction.NORTH;
    case Direction.WEST:
      return direction2 === Direction.EAST;
  }
}

async function readInput(file: string): Promise<number[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input
    .split("\n")
    .map((line) => line.split("").map((n) => parseInt(n)));
}
