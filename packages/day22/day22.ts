class Block3D {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  z1: number;
  z2: number;
  id: number;

  constructor(stringRepresentation: string, id: number) {
    const ends = stringRepresentation.split("~");
    const start = ends[0].split(",");
    const end = ends[1].split(",");

    this.x1 = parseInt(start[0]);
    this.x2 = parseInt(end[0]);
    this.y1 = parseInt(start[1]);
    this.y2 = parseInt(end[1]);
    this.z1 = parseInt(start[2]);
    this.z2 = parseInt(end[2]);
    this.id = id;
  }

  public moveDown(fixedBlocks: Block3D[]): void {
    const collidingBlock = fixedBlocks
      .sort((a, b) => b.z2 - a.z2)
      .find((otherBlock) => this.matchXY(otherBlock));

    const zDiff = this.z2 - this.z1;

    this.z1 = collidingBlock == null ? 1 : collidingBlock.z2 + 1;
    this.z2 = this.z1 + zDiff;
  }

  public countDependantBlocks(allBlocks: Block3D[]): number {
    const fallenBlocks = new Set<number>();
    fallenBlocks.add(this.id);

    const blocksToCheck = this.blocksAbove(allBlocks);

    while (blocksToCheck.length > 0) {
      const checkBlock = blocksToCheck.shift();

      const blocksBelow =
        checkBlock
          ?.blocksBelow(allBlocks)
          .filter((blockBelow) => !fallenBlocks.has(blockBelow.id)) ?? [];

      if (blocksBelow.length === 0) {
        fallenBlocks.add(checkBlock?.id ?? -1);
        blocksToCheck.push(...(checkBlock?.blocksAbove(allBlocks) ?? []));
      }
    }

    return fallenBlocks.size - 1;
  }

  public canDisintegrate(allBlocks: Block3D[]): boolean {
    const blocksAbove = this.blocksAbove(allBlocks);

    return blocksAbove.every(
      (block) => block.blocksBelow(allBlocks).length > 1,
    );
  }

  public blocksAbove(allBlocks: Block3D[]): Block3D[] {
    return allBlocks.filter(
      (other) => other.z1 === this.z2 + 1 && this.matchXY(other),
    );
  }

  public blocksBelow(allBlocks: Block3D[]): Block3D[] {
    return allBlocks.filter(
      (other) => other.z2 === this.z1 - 1 && this.matchXY(other),
    );
  }

  private matchXY(other: Block3D): boolean {
    return (
      this.x1 <= other.x2 &&
      this.x2 >= other.x1 &&
      this.y1 <= other.y2 &&
      this.y2 >= other.y1
    );
  }
}

const input = await readInput("input.txt");

// sort by lowest z-value
input.sort((a, b) => a.z2 - b.z2);

for (let i = 0; i < input.length; ++i) {
  input[i].moveDown(input.slice(0, i));
}

console.log(input.filter((block) => block.canDisintegrate(input)).length);

console.log(
  input
    .map((block) => block.countDependantBlocks(input))
    .reduce((previous, current) => previous + current, 0),
);

async function readInput(file: string): Promise<Block3D[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line, id) => new Block3D(line, id));
}
