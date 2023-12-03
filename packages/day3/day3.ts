interface SchemaNumber {
  number: number;
  row: number;
  startIndex: number;
  endIndex: number;
}

const input = await readInput("input.txt");
const schemaNumbers = findNumbers(input);

const part1 = schemaNumbers
  .filter((n) => isValidNumber(n, input))
  .map((n) => n.number)
  .reduce((acc, current) => acc + current, 0);
console.log(part1);

const part2 = findGearsNumbers(input, schemaNumbers)
  .map((gear) =>
    gear.map((n) => n.number).reduce((acc, current) => acc * current, 1),
  )
  .reduce((acc, current) => acc + current, 0);
console.log(part2);

function findNumbers(input: string[][]): SchemaNumber[] {
  const result: SchemaNumber[] = [];
  let buffer = "";
  let startIndex = -1;

  input.forEach((line, row) => {
    line.forEach((value, column) => {
      const parsed = parseInt(value);
      if (isNaN(parsed)) {
        if (buffer.length > 0) {
          result.push({
            number: parseInt(buffer),
            row,
            startIndex,
            endIndex: column - 1,
          });
          buffer = "";
          startIndex = -1;
        }
      } else {
        if (startIndex === -1) {
          startIndex = column;
        }
        buffer += parsed;
      }
    });

    if (buffer.length > 0) {
      result.push({
        number: parseInt(buffer),
        row,
        startIndex,
        endIndex: input[row].length - 1,
      });
      buffer = "";
      startIndex = -1;
    }
  });

  return result;
}

function isValidNumber(number: SchemaNumber, input: string[][]): boolean {
  for (let row = number.row - 1; row <= number.row + 1; row++) {
    if (row < 0 || row >= input.length) {
      continue;
    }

    for (
      let column = number.startIndex - 1;
      column <= number.endIndex + 1;
      column++
    ) {
      if (
        column >= 0 &&
        column < input[row].length &&
        (row !== number.row ||
          column < number.startIndex ||
          column > number.endIndex) &&
        input[row][column] !== "." &&
        isNaN(parseInt(input[row][column]))
      ) {
        return true;
      }
    }
  }

  return false;
}

function findGearsNumbers(
  input: string[][],
  numbers: SchemaNumber[],
): SchemaNumber[][] {
  const result = [];
  for (let row = 0; row < input.length; ++row) {
    for (let column = 0; column < input[row].length; ++column) {
      if (input[row][column] === "*") {
        const neighborNumbers = findNeighborNumbers(row, column, numbers);

        if (neighborNumbers.length === 2) {
          result.push(neighborNumbers);
        }
      }
    }
  }

  return result;
}

function findNeighborNumbers(
  row: number,
  column: number,
  numbers: SchemaNumber[],
): SchemaNumber[] {
  return numbers.filter(
    (number) =>
      number.row >= row - 1 &&
      number.row <= row + 1 &&
      number.startIndex <= column + 1 &&
      number.endIndex >= column - 1,
  );
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
