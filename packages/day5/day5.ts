import { Presets, SingleBar } from "cli-progress";

interface Input {
  seeds: number[];
  converters: Converter[];
}

interface Converter {
  source: string;
  destination: string;
  items: ConverterItem[];
}

interface ConverterItem {
  destinationRangeStart: number;
  sourceRangeStart: number;
  rangeLength: number;
}

interface Location {
  number: number;
  element: string;
}

const input = await readInput("input.txt");
console.log(run(input.seeds, input.converters));
console.log(runRange(input.seeds, input.converters));

// 2520480 is too high

function run(seeds: number[], converters: Converter[]): number {
  let minimum = Infinity;

  for (const seed of seeds) {
    const result = mapTo(
      {
        number: seed,
        element: "seed",
      },
      "location",
      converters,
    );

    if (result < minimum) {
      minimum = result;
    }
  }

  return minimum;
}

function runRange(seeds: number[], converters: Converter[]): number {
  let minimum = Infinity;
  let seedIndex = 0;

  while (seedIndex < seeds.length) {
    const start = seeds[seedIndex];
    const range = seeds[seedIndex + 1];

    const bar = new SingleBar({}, Presets.shades_grey);
    bar.start(range, 0);
    for (let i = start; i < start + range; ++i) {
      const result = mapTo(
        {
          number: i,
          element: "seed",
        },
        "location",
        converters,
      );

      if (result < minimum) {
        minimum = result;
      }

      bar.increment(1);
    }
    bar.stop();

    seedIndex += 2;
  }

  return minimum;
}

function mapTo(
  location: Location,
  targetElement: string,
  converters: Converter[],
): number {
  let intermediateLocation = location;

  while (intermediateLocation.element !== targetElement) {
    intermediateLocation = map(intermediateLocation, converters);
  }

  return intermediateLocation.number;
}

function map(location: Location, converters: Converter[]): Location {
  // find converter that maps location.element
  const converter = converters.find(
    (converter) => converter.source === location.element,
  );

  if (converter == null) {
    throw new Error(`no converter found for ${location.element}`);
  }

  const destinationElement = converter.destination;

  for (const converterItem of converter.items) {
    if (
      location.number >= converterItem.sourceRangeStart &&
      location.number <
        converterItem.sourceRangeStart + converterItem.rangeLength
    ) {
      const offset = location.number - converterItem.sourceRangeStart;
      return {
        number: converterItem.destinationRangeStart + offset,
        element: destinationElement,
      };
    }
  }

  return {
    number: location.number,
    element: destinationElement,
  };
}

async function readInput(file: string): Promise<Input> {
  const input = (await Bun.file(file).text()).trim();
  let seeds: number[] = [];
  const converters: Converter[] = [];

  input.split("\n\n").forEach((section) => {
    if (section.startsWith("seeds: ")) {
      seeds = readSeedSection(section);
    } else {
      converters.push(readMapSection(section));
    }
  });

  return {
    seeds,
    converters,
  };
}

function readSeedSection(section: string): number[] {
  return section
    .substring(7)
    .split(" ")
    .map((n) => parseInt(n));
}

function readMapSection(section: string): Converter {
  const split = section.split("\n");
  const headerMatch = [...split[0].matchAll(/^(\w+)-to-(\w+) map:$/gi)][0];
  const source = headerMatch[1] ?? "";
  const destination = headerMatch[2] ?? "";

  const items: ConverterItem[] = split.slice(1).map((line) => {
    const lineSplit = line.split(" ");
    return {
      destinationRangeStart: parseInt(lineSplit[0]),
      sourceRangeStart: parseInt(lineSplit[1]),
      rangeLength: parseInt(lineSplit[2]),
    };
  });

  return {
    source,
    destination,
    items,
  };
}
