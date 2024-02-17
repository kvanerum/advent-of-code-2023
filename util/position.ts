import { Direction } from "./direction";

export class Position {
  readonly row: number;
  readonly column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }

  north(): Position {
    return new Position(this.row - 1, this.column);
  }

  south(): Position {
    return new Position(this.row + 1, this.column);
  }

  east(): Position {
    return new Position(this.row, this.column + 1);
  }

  west(): Position {
    return new Position(this.row, this.column - 1);
  }

  goInDirection(direction: Direction): Position {
    switch (direction) {
      case Direction.NORTH:
        return this.north();
      case Direction.SOUTH:
        return this.south();
      case Direction.EAST:
        return this.east();
      case Direction.WEST:
        return this.west();
    }
  }

  equals(o: Position): boolean {
    return this.row === o.row && this.column === o.column;
  }

  isInBounds(width: number, height: number): boolean {
    return (
      this.row >= 0 &&
      this.row < height &&
      this.column >= 0 &&
      this.column < width
    );
  }

  toString(): string {
    return `${this.row},${this.column}`;
  }
}

export function P(row: number, column: number): Position {
  return new Position(row, column);
}

export function parsePosition(str: string): Position {
  const split = str.split(",");
  return P(parseInt(split[0]), parseInt(split[1]));
}
