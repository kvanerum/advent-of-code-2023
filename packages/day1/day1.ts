let input = await Bun.file("input.txt").text();
input = input.trim();

const numberMap = new Map([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
]);

console.log(
  input
    .split("\n")
    .map((line) => extractNumber(line, false))
    .reduce((acc, current) => acc + current, 0),
);

console.log(
  input
    .split("\n")
    .map((line) => extractNumber(line, true))
    .reduce((acc, current) => acc + current, 0),
);

function extractNumber(input: string, replaceSpelledNumbers: boolean): number {
  const left = findLeftNumber(input, replaceSpelledNumbers);
  const right = findRightNumber(input, replaceSpelledNumbers);

  return left * 10 + right;
}

function findLeftNumber(input: string, replaceSpelledNumbers: boolean): number {
  let i = 0;

  while (i <= input.length) {
    const substring = input.substring(0, i);
    const number = getNumber(substring, replaceSpelledNumbers);

    if (number !== undefined) {
      return number;
    }

    ++i;
  }

  return 0;
}

function findRightNumber(
  input: string,
  replaceSpelledNumbers: boolean,
): number {
  let i = 0;

  while (i <= input.length) {
    const substring = input.substring(input.length - i);
    const number = getNumber(substring, replaceSpelledNumbers);

    if (number !== undefined) {
      return number;
    }

    ++i;
  }

  return 0;
}

function getNumber(
  substring: string,
  replaceSpelledNumbers: boolean,
): number | undefined {
  if (replaceSpelledNumbers) {
    numberMap.forEach((value, spelled) => {
      substring = substring.replace(spelled, value.toString(10));
    });
  }
  const match = substring.match(/\d/g);

  if (match != null) {
    return parseInt(match[0], 10);
  }

  return undefined;
}
