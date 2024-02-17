import { P, parsePosition, type Position } from "../../util/position.ts";
import { Direction } from "../../util/direction.ts";

const input = await readInput("input.txt");

run(26501365, input.length);

function run(steps: number, tileSize: number): void {
  const quadrantSize = Math.floor(steps / tileSize);
  let result = 940 + 5607 + 936; // first row

  // top
  let middlePart = 7490;
  for (let i = 1; i < quadrantSize; ++i) {
    result += 940 + 6516; // left
    result += middlePart;
    result += 6514 + 936; // right
    middlePart += 7490 + 7423;
  }

  // middle row
  result += 5612 + 5589;
  result += quadrantSize * 7490;
  result += (quadrantSize - 1) * 7423;

  // bottom
  middlePart = 7490;
  for (let i = 1; i < quadrantSize; ++i) {
    result += 972 + 6519; // left
    result += middlePart;
    result += 6498 + 955; // right
    middlePart += 7490 + 7423;
  }

  result += 972 + 5594 + 955; // last row

  console.log(result);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function runNaive(
  map: string[][],
  startPosition: Position,
  steps: number,
  useBounds: boolean,
): void {
  let visitedPositions = new Set([startPosition.toString()]);

  for (let i = 0; i < steps; ++i) {
    const nextVisitedPositions = new Set<string>();
    for (const visitedPositionStr of visitedPositions) {
      const visitedPosition = parsePosition(visitedPositionStr);
      [
        Direction.NORTH,
        Direction.EAST,
        Direction.SOUTH,
        Direction.WEST,
      ].forEach((direction) => {
        const nextPosition = visitedPosition.goInDirection(direction);

        if (
          (!useBounds || nextPosition.isInBounds(map[0].length, map.length)) &&
          getTile(map, nextPosition) !== "#" &&
          !nextVisitedPositions.has(nextPosition.toString())
        ) {
          nextVisitedPositions.add(nextPosition.toString());
        }
      });
    }

    visitedPositions = nextVisitedPositions;
  }

  countPerTile(visitedPositions, map.length);
}

function getTile(map: string[][], position: Position): string {
  let mappedRow = position.row % map.length;
  if (mappedRow < 0) {
    mappedRow = map.length + mappedRow;
  }
  let mappedColumn = position.column % map[0].length;
  if (mappedColumn < 0) {
    mappedColumn = map[0].length + mappedColumn;
  }

  const tile = map[mappedRow][mappedColumn];

  return tile === "S" ? "." : tile;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findStartPosition(map: string[][]): Position {
  for (let row = 0; row < map.length; ++row) {
    for (let column = 0; column < map[row].length; ++column) {
      if (map[row][column] === "S") {
        return P(row, column);
      }
    }
  }

  throw new Error("start position not found");
}

function countPerTile(positions: Set<string>, tileSize: number): void {
  const tiles = new Map<number, Map<number, number>>();

  positions.forEach((position) => {
    const p = parsePosition(position);

    const col = Math.floor(p.column / tileSize);
    const row = Math.floor(p.row / tileSize);

    let tileRow = tiles.get(row);

    if (tileRow === undefined) {
      tileRow = new Map<number, number>();
      tiles.set(row, tileRow);
    }

    tileRow.set(col, (tileRow.get(col) ?? 0) + 1);
  });

  const rowArray = [...tiles.keys()];
  const columns = [...tiles.values()].flatMap((v) => [...v.keys()]);
  for (let r = Math.min(...rowArray); r <= Math.max(...rowArray); ++r) {
    let out = "";
    for (let c = Math.min(...columns); c <= Math.max(...columns); ++c) {
      out += String(tiles.get(r)?.get(c) ?? 0).padEnd(10);
    }
    console.log(out);
  }

  console.log("\n\n");
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
