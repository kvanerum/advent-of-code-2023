interface Input {
  instructions: string[];
  map: Map<string, Node>;
}

interface Node {
  left: string;
  right: string;
}

const input = await readInput("input.txt");
console.log(run("AAA", input, false));

const part2 = Array.from(input.map.keys())
  .filter((p) => p.charAt(2) === "A")
  .map((p) => run(p, input, true))
  .reduce((acc, current) => {
    const increment = Math.max(current, acc);
    let iterator = increment;

    while (iterator % acc !== 0 || iterator % current !== 0) {
      iterator += increment;
    }

    return iterator;
  }, 1);
console.log(part2);

function run(position: string, input: Input, part2: boolean): number {
  let step = 0;
  let currentPosition = position;

  while (!stopConditionReached(currentPosition, part2)) {
    const direction = input.instructions[step % input.instructions.length];

    currentPosition =
      (direction === "R"
        ? input.map.get(currentPosition)?.right
        : input.map.get(currentPosition)?.left) ?? position;

    step++;
  }

  return step;
}

function stopConditionReached(position: string, part2: boolean): boolean {
  if (!part2) {
    return position === "ZZZ";
  } else {
    return position.charAt(2) === "Z";
  }
}

async function readInput(file: string): Promise<Input> {
  const input = (await Bun.file(file).text()).trim();
  const split = input.split("\n\n");
  const map = new Map();

  split[1].split("\n").forEach((line) => {
    const matches = [...line.matchAll(/^(\w+) = \((\w+), (\w+)\)$/gi)][0];

    map.set(matches[1], {
      left: matches[2],
      right: matches[3],
    });
  });

  return {
    instructions: split[0].split(""),
    map,
  };
}
