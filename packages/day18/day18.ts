import { Direction } from "../../util/direction.ts";
import { P, type Position } from "../../util/position.ts";

interface Instruction {
  direction: Direction;
  count: number;
  rgb?: string;
}

interface Line {
  start: Position;
  direction: "H" | "V";
  size: number;
}

const input = await readInput("input.txt");

console.log(calculateTrenchCount(input));
console.log(calculateTrenchCount(input.map((i) => transformInstruction(i))));

function calculateTrenchCount(instructions: Instruction[]): number {
  const lines = generateLines(instructions);

  const horizontalLinesRows = lines
    .filter((line) => line.direction === "H")
    .map((line) => line.start.row);
  const min = Math.min(...horizontalLinesRows);
  const max = Math.max(...horizontalLinesRows);

  let total = 0;
  for (let row = min; row <= max; ++row) {
    total += calculateRow(row, lines);
  }

  return total;
}

function calculateRow(row: number, lines: Line[]): number {
  const verticalLines = lines
    .filter(
      (l) =>
        l.direction === "V" &&
        l.start.row <= row &&
        l.start.row + l.size >= row,
    )
    .sort((a, b) => a.start.column - b.start.column);

  let count = 0;

  for (let lineIndex = 0; lineIndex < verticalLines.length; ++lineIndex) {
    const verticalLine = verticalLines[lineIndex];
    const horizontalLine = lines.find(
      (l) =>
        l.direction === "H" &&
        l.start.row === row &&
        l.start.column === verticalLine.start.column,
    );

    if (
      horizontalLine !== undefined &&
      ((verticalLine.start.row === row &&
        verticalLines[lineIndex + 1].start.row === row) ||
        (verticalLine.start.row < row &&
          verticalLines[lineIndex + 1].start.row < row))
    ) {
      lineIndex++;
      count +=
        Math.abs(
          verticalLines[lineIndex].start.column - verticalLine.start.column,
        ) + 1;
    } else {
      if (horizontalLine !== undefined) {
        lineIndex++;
      }
      lineIndex++;
      let lineToCheck = verticalLines[lineIndex];
      while (
        (lineToCheck.start.row === row ||
          lineToCheck.start.row + lineToCheck.size === row) &&
        !isSecondLineOfHorizontalInTwoDirection(lineToCheck, lines, row)
      ) {
        lineIndex++;
        lineToCheck = verticalLines[lineIndex];
      }

      count +=
        Math.abs(
          verticalLines[lineIndex].start.column - verticalLine.start.column,
        ) + 1;
    }
  }

  return count;
}

function isSecondLineOfHorizontalInTwoDirection(
  line: Line,
  lines: Line[],
  row: number,
): boolean {
  const horizontalLine = lines.find(
    (l) =>
      l.direction === "H" &&
      l.start.row === row &&
      l.start.column + l.size === line.start.column,
  );

  if (horizontalLine === undefined) {
    return false;
  }

  const firstVerticalLine = lines.find(
    (l) =>
      l.direction === "V" &&
      l.start.column === horizontalLine.start.column &&
      (l.start.row === row || l.start.row + l.size === row),
  );

  if (firstVerticalLine === undefined) {
    throw new Error();
  }

  return (
    (firstVerticalLine.start.row < row && line.start.row === row) ||
    (firstVerticalLine.start.row === row && line.start.row < row)
  );
}

function generateLines(instructions: Instruction[]): Line[] {
  let position = P(0, 0);
  const result: Line[] = [];

  for (const instruction of instructions) {
    const size = instruction.count;
    let start: Position;
    switch (instruction.direction) {
      case Direction.EAST: {
        start = position;
        position = P(position.row, position.column + instruction.count);
        break;
      }
      case Direction.SOUTH: {
        start = position;
        position = P(position.row + instruction.count, position.column);
        break;
      }
      case Direction.NORTH: {
        start = P(position.row - instruction.count, position.column);
        position = start;
        break;
      }
      case Direction.WEST:
        start = P(position.row, position.column - instruction.count);
        position = start;
        break;
    }
    const direction =
      instruction.direction === Direction.WEST ||
      instruction.direction === Direction.EAST
        ? "H"
        : "V";

    result.push({
      start,
      size,
      direction,
    });
  }

  return result;
}

function getDirectionFromChar(direction: string): Direction {
  switch (direction) {
    case "R":
      return Direction.EAST;
    case "D":
      return Direction.SOUTH;
    case "L":
      return Direction.WEST;
    case "U":
      return Direction.NORTH;
    default:
      throw new Error("unknown direction");
  }
}

function getDirectionFromNumber(direction: string): Direction {
  switch (direction) {
    case "0":
      return Direction.EAST;
    case "1":
      return Direction.SOUTH;
    case "2":
      return Direction.WEST;
    case "3":
      return Direction.NORTH;
    default:
      throw new Error("unknown direction");
  }
}

async function readInput(file: string): Promise<Instruction[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => lineToInstruction(line));
}

function lineToInstruction(line: string): Instruction {
  const split = line.split(" ");

  return {
    direction: getDirectionFromChar(split[0]),
    count: parseInt(split[1]),
    rgb: split[2].substring(2, split[2].length - 1),
  };
}

function transformInstruction(instruction: Instruction): Instruction {
  return {
    direction: getDirectionFromNumber(instruction.rgb?.substring(5) ?? ""),
    count: parseInt(instruction.rgb?.substring(0, 5) ?? "", 16),
  };
}
