interface Hand {
  cards: string[];
  bid: number;
  score: number;
  scoreWithJokers: number;
}

enum Score {
  HIGH_CARD,
  ONE_PAIR,
  TWO_PAIR,
  THREE_OF_A_KIND,
  FULL_HOUSE,
  FOUR_OF_A_KIND,
  FIVE_OF_A_KIND,
}

const cardsStrength = new Map<string, number>(
  ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"].map(
    (card, index, a) => [card, a.length - index],
  ),
);
const cardsStrengthWithJoker = new Map<string, number>(
  ["A", "K", "Q", "T", "9", "8", "7", "6", "5", "4", "3", "2", "J"].map(
    (card, index, a) => [card, a.length - index],
  ),
);

const input = await readInput("input.txt");

const part1 = input
  .sort(getSorter(false))
  .map((hand, rank) => hand.bid * (rank + 1))
  .reduce((acc, current) => acc + current, 0);
console.log(part1);

cardsStrength.set("J", -1);
const part2 = input
  .sort(getSorter(true))
  .map((hand, rank) => hand.bid * (rank + 1))
  .reduce((acc, current) => acc + current, 0);
console.log(part2);

function getSorter(useJoker: boolean): (a: Hand, b: Hand) => number {
  return (a: Hand, b: Hand) => {
    const aScore = useJoker ? a.scoreWithJokers : a.score;
    const bScore = useJoker ? b.scoreWithJokers : b.score;

    if (aScore < bScore) {
      return -1;
    } else if (aScore > bScore) {
      return 1;
    }

    for (let i = 0; i < a.cards.length; ++i) {
      const aCardStrength =
        (useJoker ? cardsStrengthWithJoker : cardsStrength).get(a.cards[i]) ??
        -100;
      const bCardStrength =
        (useJoker ? cardsStrengthWithJoker : cardsStrength).get(b.cards[i]) ??
        -100;
      if (aCardStrength < bCardStrength) {
        return -1;
      } else if (aCardStrength > bCardStrength) {
        return 1;
      }
    }

    return 0;
  };
}

function calculateScore(cards: string[], useJoker: boolean): Score {
  const cardsMap = cards.reduce(
    (m, currentCard) => m.set(currentCard, (m.get(currentCard) ?? 0) + 1),
    new Map<string, number>(),
  );

  if (cardsMap.size === 1) {
    return Score.FIVE_OF_A_KIND;
  }

  const numberOfJokers = cardsMap.get("J") ?? 0;
  if (useJoker && numberOfJokers > 0) {
    const mostOccurringCard = Array.from(cardsMap.entries())
      .filter(([card, _]) => card !== "J")
      .sort(([_, a], [__, b]) => b - a)[0][0];

    cardsMap.set(
      mostOccurringCard,
      (cardsMap.get(mostOccurringCard) ?? 0) + numberOfJokers,
    );
    cardsMap.delete("J");
  }

  const occurrenceArray = Array.from(cardsMap.values());

  if (occurrenceArray.length === 1) {
    return Score.FIVE_OF_A_KIND;
  } else if (occurrenceArray.some((o) => o === 4)) {
    return Score.FOUR_OF_A_KIND;
  } else if (
    occurrenceArray.length === 2 &&
    occurrenceArray.some((o) => o === 3)
  ) {
    return Score.FULL_HOUSE;
  } else if (occurrenceArray.some((o) => o === 3)) {
    return Score.THREE_OF_A_KIND;
  } else if (
    occurrenceArray.length === 4 &&
    occurrenceArray.some((o) => o === 2)
  ) {
    return Score.ONE_PAIR;
  } else if (occurrenceArray.length === 3) {
    return Score.TWO_PAIR;
  } else {
    return Score.HIGH_CARD;
  }
}

async function readInput(file: string): Promise<Hand[]> {
  const input = (await Bun.file(file).text()).trim();

  return input
    .trim()
    .split("\n")
    .map((line) => lineToHand(line));
}

function lineToHand(line: string): Hand {
  const split = line.split(" ");
  const cards = split[0].split("");

  return {
    cards,
    bid: parseInt(split[1]),
    score: calculateScore(cards, false),
    scoreWithJokers: calculateScore(cards, true),
  };
}
