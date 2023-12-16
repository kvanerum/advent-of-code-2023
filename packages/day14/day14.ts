class Configuration {
  private readonly roundedRocks: number[][];
  private readonly cubeRocks: number[][];
  private readonly size: number;

  private constructor(
    roundedRocks: number[][],
    cubeRocks: number[][],
    size: number,
  ) {
    this.roundedRocks = roundedRocks;
    this.cubeRocks = cubeRocks;
    this.size = size;
  }

  static fromInput(input: string): Configuration {
    const rows = input.split("\n");
    const roundedRocks: number[][] = [];
    const cubeRocks: number[][] = [];

    for (let row = 0; row < rows.length; ++row) {
      for (let column = 0; column < rows[row].length; ++column) {
        if (rows[row][column] === "O") {
          roundedRocks.push([row, column]);
        } else if (rows[row][column] === "#") {
          cubeRocks.push([row, column]);
        }
      }
    }

    return new Configuration(roundedRocks, cubeRocks, rows.length);
  }

  public cycle(): Configuration {
    return this.tiltNorth().tiltWest().tiltSouth().tiltEast();
  }

  public tiltNorth(): Configuration {
    const movedRoundedRocks: number[][] = [];

    for (const rock of this.roundedRocks) {
      const cubedRocksAbove = this.cubeRocks
        .filter((cubeRock) => cubeRock[1] === rock[1] && cubeRock[0] < rock[0])
        .map((cubeRock) => cubeRock[0]);
      const nearestCubedRockAbove =
        cubedRocksAbove.length === 0 ? -1 : Math.max(...cubedRocksAbove);
      const roundRocksInBetween = this.roundedRocks.filter(
        (r) =>
          r[1] === rock[1] && r[0] > nearestCubedRockAbove && r[0] < rock[0],
      ).length;
      movedRoundedRocks.push([
        nearestCubedRockAbove + roundRocksInBetween + 1,
        rock[1],
      ]);
    }

    return new Configuration(movedRoundedRocks, this.cubeRocks, this.size);
  }

  public tiltSouth(): Configuration {
    const movedRoundedRocks: number[][] = [];

    for (const rock of this.roundedRocks) {
      const cubedRocksBelow = this.cubeRocks
        .filter((cubeRock) => cubeRock[1] === rock[1] && cubeRock[0] > rock[0])
        .map((cubeRock) => cubeRock[0]);
      const nearestCubedRockBelow =
        cubedRocksBelow.length === 0 ? this.size : Math.min(...cubedRocksBelow);
      const roundRocksInBetween = this.roundedRocks.filter(
        (r) =>
          r[1] === rock[1] && r[0] < nearestCubedRockBelow && r[0] > rock[0],
      ).length;
      movedRoundedRocks.push([
        nearestCubedRockBelow - roundRocksInBetween - 1,
        rock[1],
      ]);
    }

    return new Configuration(movedRoundedRocks, this.cubeRocks, this.size);
  }

  public tiltEast(): Configuration {
    const movedRoundedRocks: number[][] = [];

    for (const rock of this.roundedRocks) {
      const cubedRocksRight = this.cubeRocks
        .filter((cubeRock) => cubeRock[0] === rock[0] && cubeRock[1] > rock[1])
        .map((cubeRock) => cubeRock[1]);
      const nearestCubedRockRight =
        cubedRocksRight.length === 0 ? this.size : Math.min(...cubedRocksRight);
      const roundRocksInBetween = this.roundedRocks.filter(
        (r) =>
          r[0] === rock[0] && r[1] < nearestCubedRockRight && r[1] > rock[1],
      ).length;
      movedRoundedRocks.push([
        rock[0],
        nearestCubedRockRight - roundRocksInBetween - 1,
      ]);
    }

    return new Configuration(movedRoundedRocks, this.cubeRocks, this.size);
  }

  public tiltWest(): Configuration {
    const movedRoundedRocks: number[][] = [];

    for (const rock of this.roundedRocks) {
      const cubedRocksLeft = this.cubeRocks
        .filter((cubeRock) => cubeRock[0] === rock[0] && cubeRock[1] < rock[1])
        .map((cubeRock) => cubeRock[1]);
      const nearestCubedRockLeft =
        cubedRocksLeft.length === 0 ? -1 : Math.max(...cubedRocksLeft);
      const roundRocksInBetween = this.roundedRocks.filter(
        (r) =>
          r[0] === rock[0] && r[1] > nearestCubedRockLeft && r[1] < rock[1],
      ).length;
      movedRoundedRocks.push([
        rock[0],
        nearestCubedRockLeft + roundRocksInBetween + 1,
      ]);
    }

    return new Configuration(movedRoundedRocks, this.cubeRocks, this.size);
  }

  public calculateLoad(): number {
    return this.roundedRocks
      .map((rock) => this.size - rock[0])
      .reduce((acc, current) => acc + current, 0);
  }

  public print(): void {
    for (let row = 0; row < this.size; ++row) {
      let rowString = "";
      for (let column = 0; column < this.size; ++column) {
        if (this.roundedRocks.some((e) => e[0] === row && e[1] === column)) {
          rowString += "O";
        } else if (
          this.cubeRocks.some((e) => e[0] === row && e[1] === column)
        ) {
          rowString += "#";
        } else {
          rowString += ".";
        }
      }
      console.log(rowString);
    }
  }
}

const input = await readInput("input.txt");

const tilted = input.tiltNorth();
console.log(tilted.calculateLoad());

let cycled = input;
const loads = [];
const sampleSize = 500;
for (let i = 0; i < sampleSize; ++i) {
  cycled = cycled.cycle();
  loads.push(cycled.calculateLoad());
  console.log(i, loads[loads.length - 1]);
}

const pattern = findPattern(loads);
console.log(pattern[(1000000000 - sampleSize - 1) % pattern.length]);

function findPattern(list: number[]): number[] {
  const maxPatternSize = 100;

  for (let size = 1; size < maxPatternSize; size++) {
    if (isValidPattern(list, size)) {
      return list.slice(list.length - size);
    }
  }

  return [];
}

function isValidPattern(list: number[], size: number): boolean {
  for (let i = 0; i < size; ++i) {
    const value = list[list.length - 1 - i];

    let checkIndex = list.length - 1 - i;
    while (checkIndex > 100) {
      if (list[checkIndex] !== value) {
        return false;
      }
      checkIndex -= size;
    }
  }

  return true;
}

async function readInput(file: string): Promise<Configuration> {
  const input = (await Bun.file(file).text()).trim();

  return Configuration.fromInput(input);
}
