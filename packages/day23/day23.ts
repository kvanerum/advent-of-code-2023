import { P, type Position } from "../../util/position.ts";
import { Direction } from "../../util/direction.ts";

interface Edge {
  from: Position;
  to: Position;
  length: number;
}

class PathStep {
  readonly comingFrom: Direction;
  readonly position: Position;

  constructor(position: Position, comingFrom: Direction) {
    this.position = position;
    this.comingFrom = comingFrom;
  }

  public move(direction: Direction): PathStep {
    return new PathStep(
      this.position.goInDirection(direction),
      getOppositeDirection(direction),
    );
  }

  public toString(): string {
    return `${this.position.toString()},${this.comingFrom}`;
  }
}

const input = await readInput("input.txt");
const start = P(0, 1);
const end = P(input.length - 1, input.length - 2);

// part 1
const paths: Array<Set<string>> = [];
findPathsPart1(start, new Set<string>(), input);

console.log(Math.max(...paths.map((p) => p.size)));

// part 2

const edges = createGraph(input, start);

const allPaths: Edge[][] = [];
findPaths(start, end, edges, new Set(), [], allPaths);
console.log(findLongestPath(allPaths));

function createGraph(map: string[][], startPosition: Position): Edge[] {
  const edges: Edge[] = [];

  const pathsToCheck: PathStep[] = [
    new PathStep(startPosition.south(), Direction.NORTH),
  ];
  const checkedTiles = new Set<string>();

  let currentPathToCheck = pathsToCheck.shift();
  while (currentPathToCheck != null) {
    let pathIterator = currentPathToCheck;
    let pathSize = 0;

    if (checkedTiles.has(pathIterator.position.toString())) {
      currentPathToCheck = pathsToCheck.shift();
      continue;
    }

    while (pathIterator != null) {
      pathSize++;

      checkedTiles.add(pathIterator.position.toString());
      const possibleSteps = [
        Direction.NORTH,
        Direction.EAST,
        Direction.SOUTH,
        Direction.WEST,
      ]
        .filter((direction) => pathIterator?.comingFrom !== direction)
        .map((direction) => pathIterator.move(direction))
        .filter(
          (pathStep) => getTile(pathStep?.position ?? P(0, 0), map) !== "#",
        );

      if (possibleSteps.length === 1) {
        // continue along the path
        pathIterator = possibleSteps[0];
      } else {
        // at a crossing
        edges.push({
          from: currentPathToCheck.position.goInDirection(
            currentPathToCheck.comingFrom,
          ),
          to: pathIterator.position,
          length: pathSize,
        });

        possibleSteps
          .filter((next) => !checkedTiles.has(next.position.toString()))
          .forEach((next) => {
            pathsToCheck.push(next);
          });

        break;
      }
    }

    currentPathToCheck = pathsToCheck.shift();
  }

  return edges;
}

function findPaths(
  from: Position,
  to: Position,
  edges: Edge[],
  visitedPositions: Set<string>,
  currentPath: Edge[],
  aggregator: Edge[][],
): void {
  if (from.equals(to)) {
    aggregator.push(currentPath);
  }

  const nextSteps = edges
    .filter((edge) => edge.from.equals(from) || edge.to.equals(from))
    .filter(
      (edge) =>
        !visitedPositions.has(edge.from.toString()) &&
        !visitedPositions.has(edge.to.toString()),
    );

  nextSteps.forEach((edge) => {
    const nextPosition = edge.from.equals(from) ? edge.to : edge.from;
    const nextVisitedPositions = new Set(visitedPositions);
    nextVisitedPositions.add(from.toString());
    findPaths(
      nextPosition,
      to,
      edges,
      nextVisitedPositions,
      [...currentPath, edge],
      aggregator,
    );
  });
}

function findLongestPath(paths: Edge[][]): number {
  const pathLengths = paths.map((path) =>
    path
      .map((edge) => edge.length)
      .reduce((prev, current) => prev + current, 0),
  );

  let max = 0;
  for (const l of pathLengths) {
    if (l > max) {
      max = l;
    }
  }

  return max;
}

function findPathsPart1(
  currentPosition: Position,
  currentPath: Set<string>,
  map: string[][],
): void {
  if (currentPosition.equals(end)) {
    paths.push(currentPath);
    return;
  }

  for (const direction of [
    Direction.NORTH,
    Direction.EAST,
    Direction.SOUTH,
    Direction.WEST,
  ]) {
    const nextPosition = currentPosition.goInDirection(direction);

    if (currentPath.has(nextPosition.toString())) {
      continue;
    }

    const tile = getTile(nextPosition, map);

    if (tile === ".") {
      const nextPath = new Set(currentPath);
      nextPath.add(nextPosition.toString());
      findPathsPart1(nextPosition, nextPath, map);
    } else if (tile === ">") {
      const nextPosition2 = nextPosition.east();

      if (
        !currentPath.has(nextPosition2.toString()) &&
        getTile(nextPosition2, map) === "."
      ) {
        const nextPath = new Set(currentPath);
        nextPath.add(nextPosition.toString());
        nextPath.add(nextPosition2.toString());
        findPathsPart1(nextPosition2, nextPath, map);
      }
    } else if (tile === "<") {
      const nextPosition2 = nextPosition.west();

      if (
        !currentPath.has(nextPosition2.toString()) &&
        getTile(nextPosition2, map) === "."
      ) {
        const nextPath = new Set(currentPath);
        nextPath.add(nextPosition.toString());
        nextPath.add(nextPosition2.toString());
        findPathsPart1(nextPosition2, nextPath, map);
      }
    } else if (tile === "v") {
      const nextPosition2 = nextPosition.south();

      if (
        !currentPath.has(nextPosition2.toString()) &&
        getTile(nextPosition2, map) === "."
      ) {
        const nextPath = new Set(currentPath);
        nextPath.add(nextPosition.toString());
        nextPath.add(nextPosition2.toString());
        findPathsPart1(nextPosition2, nextPath, map);
      }
    } else if (tile === "^") {
      const nextPosition2 = nextPosition.north();

      if (
        !currentPath.has(nextPosition2.toString()) &&
        getTile(nextPosition2, map) === "."
      ) {
        const nextPath = new Set(currentPath);
        nextPath.add(nextPosition.toString());
        nextPath.add(nextPosition2.toString());
        findPathsPart1(nextPosition2, nextPath, map);
      }
    }
  }
}

function getTile(position: Position, map: string[][]): string {
  if (
    position.row >= 0 &&
    position.row < map.length &&
    position.column >= 0 &&
    position.column < map[position.row].length
  ) {
    return map[position.row][position.column];
  }

  return "#";
}

function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.NORTH:
      return Direction.SOUTH;
    case Direction.SOUTH:
      return Direction.NORTH;
    case Direction.EAST:
      return Direction.WEST;
    case Direction.WEST:
      return Direction.EAST;
  }
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
