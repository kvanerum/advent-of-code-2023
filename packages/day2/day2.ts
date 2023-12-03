interface Game {
  id: number;
  info: GameInfo[];
}

interface GameInfo {
  colors: Map<Color, number>;
}

enum Color {
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
}

const input = await readInput("input.txt");
const bagCubes = new Map([
  [Color.RED, 12],
  [Color.GREEN, 13],
  [Color.BLUE, 14],
]);

const part1 = input
  .filter(isValidGame)
  .map((game) => game.id)
  .reduce((current, acc) => current + acc, 0);
console.log(part1);

const part2 = input
  .map(calculatePower)
  .reduce((acc, current) => acc + current, 0);
console.log(part2);

function isValidGame(game: Game): boolean {
  return game.info.every((subGame) =>
    Array.from(subGame.colors.entries()).every(
      (entry) => entry[1] <= (bagCubes.get(entry[0]) ?? 0),
    ),
  );
}

function calculatePower(game: Game): number {
  const maximumCubes = new Map<Color, number>();

  game.info.forEach((subGame) => {
    Array.from(subGame.colors.entries()).forEach((entry) => {
      if ((maximumCubes.get(entry[0]) ?? 0) < entry[1]) {
        maximumCubes.set(entry[0], entry[1]);
      }
    });
  });

  return Array.from(maximumCubes.values()).reduce(
    (acc, current) => acc * current,
    1,
  );
}

async function readInput(file: string): Promise<Game[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map(lineToGame);
}

function lineToGame(line: string): Game {
  const gameIndexSplit = line.split(":");
  const gameIndex = parseInt(gameIndexSplit[0].substring(5));
  const gameSplit = gameIndexSplit[1].split("; ");

  const subGames: GameInfo[] = gameSplit.map((subGame) => {
    const colorsSplit = subGame.trim().split(", ");
    const subGameColors = new Map<Color, number>();

    colorsSplit.forEach((color) => {
      const colorSplit = color.split(" ");
      subGameColors.set(colorSplit[1] as Color, parseInt(colorSplit[0]));
    });

    return {
      colors: subGameColors,
    };
  });

  return {
    id: gameIndex,
    info: subGames,
  };
}
