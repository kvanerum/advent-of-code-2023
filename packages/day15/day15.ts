interface Lens {
  label: string;
  focalLength: number;
}

const input = await readInput("input.txt");

const part1 = input
  .map((item) => hash(item))
  .reduce((acc, current) => acc + current, 0);
console.log(part1);

const boxes = new Map<number, Lens[]>();
input.forEach((item) => {
  if (item.endsWith("-")) {
    const label = item.substring(0, item.length - 1);
    const hashed = hash(label);
    const box = boxes.get(hashed) ?? [];

    boxes.set(
      hashed,
      box.filter((lens) => lens.label !== label),
    );
  } else {
    const label = item.substring(0, item.length - 2);
    const focalLength = parseInt(item.charAt(item.length - 1));
    const hashed = hash(label);
    const box = boxes.get(hashed) ?? [];
    const lensIndex = box.findIndex((lens) => lens.label === label);

    if (lensIndex > -1) {
      box[lensIndex].focalLength = focalLength;
    } else {
      box.push({
        label,
        focalLength,
      });
    }

    boxes.set(hashed, box);
  }
});

const part2 = [...boxes.entries()]
  .map(([boxNumer, box]) =>
    box
      .map((lens, index) => (boxNumer + 1) * (index + 1) * lens.focalLength)
      .reduce((acc, current) => acc + current, 0),
  )
  .reduce((acc, current) => acc + current, 0);
console.log(part2);

function hash(input: string): number {
  let result = 0;

  input.split("").forEach((char) => {
    result += char.charCodeAt(0);
    result *= 17;
    result %= 256;
  });

  return result;
}

async function readInput(file: string): Promise<string[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split(",");
}
