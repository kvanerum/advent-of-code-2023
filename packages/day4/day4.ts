interface Card {
  number: number;
  winningNumbers: Set<number>;
  haveNumbers: Set<number>;
}

const input = await readInput("input.txt");
const part1 = input
  .map(calculateCardScore)
  .reduce((acc, current) => acc + current, 0);
console.log(part1);
console.log(part2(input));

function part2(input: Card[]): number {
  const cardCounts = input.map((_) => 1);

  for (const card of input) {
    const matchCount = calculateMatchCount(card);

    for (let i = 0; i < matchCount; ++i) {
      cardCounts[card.number + i] += cardCounts[card.number - 1];
    }
  }

  return cardCounts.reduce((acc, current) => acc + current, 0);
}

function calculateCardScore(card: Card): number {
  const matchCount = calculateMatchCount(card);

  return matchCount === 0 ? 0 : Math.pow(2, matchCount - 1);
}

function calculateMatchCount(card: Card): number {
  return [...card.haveNumbers].filter((haveNumber) =>
    card.winningNumbers.has(haveNumber),
  ).length;
}

async function readInput(file: string): Promise<Card[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map(lineToCard);
}

function lineToCard(line: string): Card {
  const cardNumberSplit = line.split(":");
  const cardNumber = parseInt(cardNumberSplit[0].substring(5).trim());
  const numbersSplit = cardNumberSplit[1].split(" | ");

  return {
    number: cardNumber,
    winningNumbers: collectNumbers(numbersSplit[0]),
    haveNumbers: collectNumbers(numbersSplit[1]),
  };
}

function collectNumbers(input: string): Set<number> {
  const result = new Set<number>();

  input
    .trim()
    .split(/\s+/)
    .map((s) => s.trim())
    .map((s) => parseInt(s))
    .forEach((n) => result.add(n));

  return result;
}
