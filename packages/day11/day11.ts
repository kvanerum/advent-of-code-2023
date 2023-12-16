interface Position {
  row: number;
  column: number;
}

const input = await readInput("input.txt");

const emptyRows = getEmptyRows(input);
const emptyColumns = getEmptyColumns(input);
const galaxyPositions = getGalaxyPositions(input);

console.log(findSumOfDistances(galaxyPositions, emptyRows, emptyColumns, 2));
console.log(
  findSumOfDistances(galaxyPositions, emptyRows, emptyColumns, 1000000),
);

function findSumOfDistances(
  galaxies: Position[],
  emptyRows: number[],
  emptyColumns: number[],
  emptyMultiplier: number,
): number {
  let sum = 0;

  for (let galaxyIndex1 = 0; galaxyIndex1 < galaxies.length; ++galaxyIndex1) {
    for (
      let galaxyIndex2 = galaxyIndex1 + 1;
      galaxyIndex2 < galaxies.length;
      galaxyIndex2++
    ) {
      sum += findDistance(
        galaxies[galaxyIndex1],
        galaxies[galaxyIndex2],
        emptyRows,
        emptyColumns,
        emptyMultiplier - 1,
      );
    }
  }
  return sum;
}

function findDistance(
  position1: Position,
  position2: Position,
  emptyRows: number[],
  emptyColumns: number[],
  emptyMultiplier: number,
): number {
  const minColumn = Math.min(position1.column, position2.column);
  const maxColumn = Math.max(position1.column, position2.column);
  const minRow = Math.min(position1.row, position2.row);
  const maxRow = Math.max(position1.row, position2.row);

  const horizontalDifference =
    maxColumn -
    minColumn +
    emptyColumns.filter((c) => c > minColumn && c < maxColumn).length *
      emptyMultiplier;
  const verticalDifference =
    maxRow -
    minRow +
    emptyRows.filter((r) => r > minRow && r < maxRow).length * emptyMultiplier;

  return horizontalDifference + verticalDifference;
}

function getGalaxyPositions(map: string[][]): Position[] {
  const result: Position[] = [];
  for (let row = 0; row < map.length; ++row) {
    for (let column = 0; column < map[row].length; ++column) {
      if (map[row][column] === "#") {
        result.push({
          row,
          column,
        });
      }
    }
  }

  return result;
}

function getEmptyRows(map: string[][]): number[] {
  const result = [];

  for (let i = 0; i < map.length; ++i) {
    if (map[i].every((c) => c === ".")) {
      result.push(i);
    }
  }

  return result;
}

function getEmptyColumns(map: string[][]): number[] {
  const result = [];

  for (let i = 0; i < map[0].length; ++i) {
    if (map.map((row) => row[i]).every((c) => c === ".")) {
      result.push(i);
    }
  }

  return result;
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
