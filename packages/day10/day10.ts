import { Direction } from "../../util/direction";
import { P, Position } from "../../util/position.ts";

const tiles = new Map([
  ["|", [Direction.NORTH, Direction.SOUTH]],
  ["-", [Direction.EAST, Direction.WEST]],
  ["L", [Direction.EAST, Direction.NORTH]],
  ["J", [Direction.WEST, Direction.NORTH]],
  ["7", [Direction.SOUTH, Direction.WEST]],
  ["F", [Direction.EAST, Direction.SOUTH]],
]);

const input = await readInput("input.txt");
const loopPath = calculateLoopPath(input);

console.log((loopPath.length - 1) / 2);

console.log(calculateLoopInsideCount(input, loopPath));

function calculateLoopInsideCount(
  map: string[][],
  loopPath: Position[],
): number {
  const extendedMap = extendMap(map, loopPath);
  const visitedPositions = new Set<string>();
  const positionsToCheck = [P(0, 0)];
  const checkedPositions = new Set<string>();

  while (positionsToCheck.length > 0) {
    const current = positionsToCheck.pop();

    if (current === undefined) {
      throw new Error();
    }

    if (extendedMap[current?.row][current?.column] === ".") {
      visitedPositions.add(current.toString());

      [
        Direction.NORTH,
        Direction.EAST,
        Direction.SOUTH,
        Direction.WEST,
      ].forEach((d) => {
        const next = current.goInDirection(d);

        if (
          next.isInBounds(extendedMap[0].length, extendedMap.length) &&
          !checkedPositions.has(next.toString())
        ) {
          positionsToCheck.push(next);
          checkedPositions.add(next.toString());
        }
      });
    }
  }

  let count = 0;
  for (let r = 0; r < map.length; ++r) {
    for (let c = 0; c < map[0].length; ++c) {
      const positionsInExtendedMap = [
        P(r * 3, c * 3),
        P(r * 3, c * 3 + 1),
        P(r * 3, c * 3 + 2),
        P(r * 3 + 1, c * 3),
        P(r * 3 + 1, c * 3 + 1),
        P(r * 3 + 1, c * 3 + 2),
        P(r * 3 + 2, c * 3),
        P(r * 3 + 2, c * 3 + 1),
        P(r * 3 + 2, c * 3 + 2),
      ];

      if (
        !positionsInExtendedMap.some((p) => visitedPositions.has(p.toString()))
      ) {
        count++;
      }
    }
  }

  return count;
}

function extendMap(map: string[][], loopPath: Position[]): string[][] {
  const loopPathSet = new Set(loopPath.map((p) => p.toString()));
  const result: string[][] = [];

  const pathStart = loopPath[0];
  const pathFirst = loopPath[1];
  const pathEnd = loopPath[loopPath.length - 2];

  const directions = [
    Direction.NORTH,
    Direction.SOUTH,
    Direction.EAST,
    Direction.WEST,
  ].filter(
    (d) =>
      pathStart.goInDirection(d).equals(pathFirst) ||
      pathStart.goInDirection(d).equals(pathEnd),
  );

  map[pathStart.row][pathStart.column] = [...tiles.entries()]
    .filter(([_, d]) => d.includes(directions[0]) && d.includes(directions[1]))
    .map(([tile, _]) => tile)[0];

  for (let row = 0; row < map.length; ++row) {
    result[row * 3] = [];
    result[row * 3 + 1] = [];
    result[row * 3 + 2] = [];
    for (let column = 0; column < map[0].length; ++column) {
      const p = P(row, column);

      if (!loopPathSet.has(p.toString())) {
        result[row * 3].push(".", ".", ".");
        result[row * 3 + 1].push(".", ".", ".");
        result[row * 3 + 2].push(".", ".", ".");
      } else if (getTile(p, map) === tiles.get("|")) {
        result[row * 3].push(".", "|", ".");
        result[row * 3 + 1].push(".", "|", ".");
        result[row * 3 + 2].push(".", "|", ".");
      } else if (getTile(p, map) === tiles.get("-")) {
        result[row * 3].push(".", ".", ".");
        result[row * 3 + 1].push("-", "-", "-");
        result[row * 3 + 2].push(".", ".", ".");
      } else if (getTile(p, map) === tiles.get("L")) {
        result[row * 3].push(".", "|", ".");
        result[row * 3 + 1].push(".", "L", "-");
        result[row * 3 + 2].push(".", ".", ".");
      } else if (getTile(p, map) === tiles.get("J")) {
        result[row * 3].push(".", "|", ".");
        result[row * 3 + 1].push("-", "J", ".");
        result[row * 3 + 2].push(".", ".", ".");
      } else if (getTile(p, map) === tiles.get("7")) {
        result[row * 3].push(".", ".", ".");
        result[row * 3 + 1].push("-", "7", ".");
        result[row * 3 + 2].push(".", "|", ".");
      } else if (getTile(p, map) === tiles.get("F")) {
        result[row * 3].push(".", ".", ".");
        result[row * 3 + 1].push(".", "F", "-");
        result[row * 3 + 2].push(".", "|", ".");
      } else {
        console.log(`can't extend tile`, getTile(p, map));
      }
    }
  }

  return result;
}

function calculateLoopPath(map: string[][]): Position[] {
  const startingPosition = getStartingPosition(map);
  const result: Position[] = [startingPosition];

  const start = findStart(startingPosition, map);
  result.push(start.position);
  let enteredFrom = start.enteredFrom;

  while (!result[result.length - 1].equals(startingPosition)) {
    const currentPosition = result[result.length - 1];
    const tile = getTile(currentPosition, map);

    const directionToGo = tile.find((d) => d !== enteredFrom);
    if (directionToGo == null) {
      throw new Error("no direction to go");
    }

    result.push(currentPosition.goInDirection(directionToGo));
    enteredFrom = getOppositeDirection(directionToGo);
  }

  return result;
}

function findStart(
  startingPosition: Position,
  map: string[][],
): { position: Position; enteredFrom: Direction } {
  const possibleDirections = [
    {
      position: startingPosition.north(),
      entryFrom: Direction.SOUTH,
    },
    {
      position: startingPosition.south(),
      entryFrom: Direction.NORTH,
    },
    {
      position: startingPosition.east(),
      entryFrom: Direction.WEST,
    },
    {
      position: startingPosition.west(),
      entryFrom: Direction.EAST,
    },
  ];

  const result = possibleDirections.find((d) =>
    getTile(d.position, map).includes(d.entryFrom),
  );

  if (result == null) {
    throw new Error("couldn't start");
  }

  return {
    position: result.position,
    enteredFrom: result.entryFrom,
  };
}

function getTile(position: Position, map: string[][]): Direction[] {
  let result;
  if (
    position.row >= 0 &&
    position.row < map.length &&
    position.column >= 0 &&
    position.column < map[position.row].length
  ) {
    result = tiles.get(map[position.row][position.column]);
  }

  return result ?? [];
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

function getStartingPosition(input: string[][]): Position {
  for (let row = 0; row < input.length; ++row) {
    for (let column = 0; column < input[row].length; ++column) {
      if (input[row][column] === "S") {
        return new Position(row, column);
      }
    }
  }

  throw new Error("No starting position");
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
