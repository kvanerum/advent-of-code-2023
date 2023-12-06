interface Race {
  time: number;
  distance: number;
}

const input = await readInput("input.txt");

const part1 = input
  .map((race) => countWaysToWin(race))
  .reduce((acc, current) => acc * current, 1);
console.log(part1);

const part2 = countWaysToWin(
  input.reduce(
    (acc, current) => ({
      time: parseInt(`${acc.time}${current.time}`),
      distance: parseInt(`${acc.distance}${current.distance}`),
    }),
    {
      time: 0,
      distance: 0,
    },
  ),
);
console.log(part2);

function countWaysToWin(race: Race): number {
  return findMaxHoldTime(race) - findMinHoldTime(race) + 1;
}

function findMinHoldTime(race: Race): number {
  for (let holdFor = 1; holdFor < race.distance; ++holdFor) {
    const timeLeft = race.time - holdFor;
    const distance = holdFor * timeLeft;

    if (distance > race.distance) {
      return holdFor;
    }
  }

  return -1;
}

function findMaxHoldTime(race: Race): number {
  for (let holdFor = race.time - 1; holdFor > 0; --holdFor) {
    const timeLeft = race.time - holdFor;
    const distance = holdFor * timeLeft;

    if (distance > race.distance) {
      return holdFor;
    }
  }

  return -1;
}

async function readInput(file: string): Promise<Race[]> {
  const input = (await Bun.file(file).text()).trim();
  const lines = input
    .trim()
    .split("\n")
    .map((line) => line.substring(11).trim());
  const times = getNumbers(lines[0]);
  const distances = getNumbers(lines[1]);

  return times.map((time, i) => ({
    time,
    distance: distances[i],
  }));
}

function getNumbers(line: string): number[] {
  return line.split(/\s+/).map((n) => parseInt(n));
}
