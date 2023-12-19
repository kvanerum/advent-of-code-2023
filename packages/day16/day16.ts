class Beam {
  public readonly row: number;
  public readonly column: number;
  public readonly direction: Direction;

  constructor(row: number, column: number, direction: Direction) {
    this.row = row;
    this.column = column;
    this.direction = direction;
  }

  public continueInDirection(): Beam {
    switch (this.direction) {
      case Direction.UP:
        return this.getUp();
      case Direction.DOWN:
        return this.getDown();
      case Direction.LEFT:
        return this.getLeft();
      case Direction.RIGHT:
        return this.getRight();
    }
  }

  public getUp(newDirection?: Direction): Beam {
    return new Beam(this.row - 1, this.column, newDirection ?? this.direction);
  }

  public getDown(newDirection?: Direction): Beam {
    return new Beam(this.row + 1, this.column, newDirection ?? this.direction);
  }

  public getLeft(newDirection?: Direction): Beam {
    return new Beam(this.row, this.column - 1, newDirection ?? this.direction);
  }

  public getRight(newDirection?: Direction): Beam {
    return new Beam(this.row, this.column + 1, newDirection ?? this.direction);
  }

  public isMovingHorizontal(): boolean {
    return (
      this.direction === Direction.LEFT || this.direction === Direction.RIGHT
    );
  }

  public isMovingVertical(): boolean {
    return this.direction === Direction.UP || this.direction === Direction.DOWN;
  }

  public serialize(): string {
    return `${this.row}-${this.column}-${this.direction}`;
  }
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const input = await readInput("input.txt");

console.log(calculateConfiguration(new Beam(0, 0, Direction.RIGHT), input));

const allConfigurations = [];

for (let row = 0; row < input.length; ++row) {
  allConfigurations.push(
    calculateConfiguration(new Beam(row, 0, Direction.RIGHT), input),
  );
  allConfigurations.push(
    calculateConfiguration(
      new Beam(row, input[row].length - 1, Direction.LEFT),
      input,
    ),
  );
}

for (let column = 0; column < input[0].length; ++column) {
  allConfigurations.push(
    calculateConfiguration(new Beam(0, column, Direction.DOWN), input),
  );
  allConfigurations.push(
    calculateConfiguration(
      new Beam(input.length - 1, column, Direction.UP),
      input,
    ),
  );
}

console.log(Math.max(...allConfigurations));

function calculateConfiguration(startBeam: Beam, map: string[][]): number {
  const visitedTiles = new Map<number, Set<number>>();
  traceBeam(startBeam, map, visitedTiles, new Set<string>());

  return countVisitedTiles(visitedTiles);
}

function traceBeam(
  beamStart: Beam,
  map: string[][],
  visitedTiles: Map<number, Set<number>>,
  checkedBeams: Set<string>,
): void {
  let beam = beamStart;
  while (isBeamAlive(beam, map)) {
    const serialized = beam.serialize();

    if (checkedBeams.has(serialized)) {
      return;
    }

    checkedBeams.add(serialized);

    const char = map[beam.row][beam.column];
    markAsVisited(beam, visitedTiles);

    if (char === ".") {
      beam = beam.continueInDirection();
    } else if (char === "|" && beam.isMovingHorizontal()) {
      traceBeam(beam.getUp(Direction.UP), map, visitedTiles, checkedBeams);
      traceBeam(beam.getDown(Direction.DOWN), map, visitedTiles, checkedBeams);
      return;
    } else if (char === "-" && beam.isMovingVertical()) {
      traceBeam(beam.getLeft(Direction.LEFT), map, visitedTiles, checkedBeams);
      traceBeam(
        beam.getRight(Direction.RIGHT),
        map,
        visitedTiles,
        checkedBeams,
      );
      return;
    } else if (char === "-" && beam.isMovingHorizontal()) {
      beam = beam.continueInDirection();
    } else if (char === "|" && beam.isMovingVertical()) {
      beam = beam.continueInDirection();
    } else if (char === "/" && beam.direction === Direction.RIGHT) {
      beam = beam.getUp(Direction.UP);
    } else if (char === "/" && beam.direction === Direction.LEFT) {
      beam = beam.getDown(Direction.DOWN);
    } else if (char === "/" && beam.direction === Direction.UP) {
      beam = beam.getRight(Direction.RIGHT);
    } else if (char === "/" && beam.direction === Direction.DOWN) {
      beam = beam.getLeft(Direction.LEFT);
    } else if (char === "\\" && beam.direction === Direction.RIGHT) {
      beam = beam.getDown(Direction.DOWN);
    } else if (char === "\\" && beam.direction === Direction.UP) {
      beam = beam.getLeft(Direction.LEFT);
    } else if (char === "\\" && beam.direction === Direction.LEFT) {
      beam = beam.getUp(Direction.UP);
    } else if (char === "\\" && beam.direction === Direction.DOWN) {
      beam = beam.getRight(Direction.RIGHT);
    } else {
      console.warn(
        `don't know what to do, travelling ${
          Direction[beam.direction]
        } encountering ${char}`,
      );
      return;
    }
  }
}

function isBeamAlive(beam: Beam, map: string[][]): boolean {
  return (
    beam.row >= 0 &&
    beam.row < map.length &&
    beam.column >= 0 &&
    beam.column < map[0].length
  );
}

function markAsVisited(
  beam: Beam,
  visitedTiles: Map<number, Set<number>>,
): void {
  let columns = visitedTiles.get(beam.row);
  if (columns === undefined) {
    columns = new Set();
    visitedTiles.set(beam.row, columns);
  }

  columns.add(beam.column);
}

function countVisitedTiles(visitedTiles: Map<number, Set<number>>): number {
  return [...visitedTiles.values()]
    .map((rows) => rows.size)
    .reduce((acc, current) => acc + current, 0);
}

async function readInput(file: string): Promise<string[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => line.split(""));
}
