const input = await readInput("input.txt");

const originalReflections = input.map((pattern) => findReflection(pattern, 0));
const part1 = originalReflections.reduce((acc, current) => acc + current, 0);
console.log(part1);

const part2 = input
  .map((pattern, index) =>
    findSmudgedReflection(pattern, originalReflections[index]),
  )
  .reduce((acc, current) => acc + current, 0);
console.log(part2);

function findSmudgedReflection(
  pattern: string[][],
  originalReflection: number,
): number {
  for (let row = 0; row < pattern.length; ++row) {
    for (let column = 0; column < pattern[row].length; ++column) {
      toggle(pattern, row, column);
      const reflection = findReflection(pattern, originalReflection);

      if (reflection >= 0 && reflection !== originalReflection) {
        return reflection;
      }

      toggle(pattern, row, column);
    }
  }

  return 0;
}

function toggle(pattern: string[][], row: number, column: number): void {
  if (pattern[row][column] === ".") {
    pattern[row][column] = "#";
  } else {
    pattern[row][column] = ".";
  }
}

function findReflection(pattern: string[][], skipValue: number): number {
  let result = -1;

  // vertical
  let verticalReflectionLine = 0;
  while (result < 0 && verticalReflectionLine < pattern[0].length - 1) {
    if (checkVerticalReflection(pattern, verticalReflectionLine)) {
      const value = verticalReflectionLine + 1;
      if (value !== skipValue) {
        result = value;
      }
    }

    verticalReflectionLine++;
  }

  // horizontal
  let horizontalReflectionLine = 0;
  while (result < 0 && horizontalReflectionLine < pattern.length - 1) {
    if (checkHorizontalReflection(pattern, horizontalReflectionLine)) {
      const value = 100 * (horizontalReflectionLine + 1);
      if (value !== skipValue) {
        result = value;
      }
    }

    horizontalReflectionLine++;
  }

  return result;
}

function checkVerticalReflection(pattern: string[][], line: number): boolean {
  let leftOfLine = line;
  let rightOfLine = line + 1;

  while (leftOfLine >= 0 && rightOfLine < pattern[0].length) {
    for (let row = 0; row < pattern.length; ++row) {
      if (pattern[row][leftOfLine] !== pattern[row][rightOfLine]) {
        return false;
      }
    }
    leftOfLine--;
    rightOfLine++;
  }

  return true;
}

function checkHorizontalReflection(pattern: string[][], line: number): boolean {
  let aboveLine = line;
  let belowLine = line + 1;

  while (aboveLine >= 0 && belowLine < pattern.length) {
    for (let column = 0; column < pattern[aboveLine].length; ++column) {
      if (pattern[aboveLine][column] !== pattern[belowLine][column]) {
        return false;
      }
    }
    aboveLine--;
    belowLine++;
  }

  return true;
}

async function readInput(file: string): Promise<string[][][]> {
  const input = (await Bun.file(file).text()).trim();

  return input
    .split("\n\n")
    .map((pattern) => pattern.split("\n").map((line) => line.split("")));
}
