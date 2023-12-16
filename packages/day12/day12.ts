interface Row {
  list: string;
  groups: number[];
}

const input = await readInput("input.txt");
const cache = new Map<string, number>();

let result = input
  .map((row) => calculateArrangements(cleanup(row.list), [...row.groups]))
  .reduce((acc, current) => acc + current, 0);
console.log(result);

result = input
  .map((row) => unfold(row))
  .map((row) => calculateArrangements(cleanup(row.list), [...row.groups]))
  .reduce((acc, current) => acc + current, 0);
console.log(result);

function unfold(row: Row): Row {
  let list = row.list;
  const groups = [...row.groups];

  for (let i = 0; i < 4; ++i) {
    list += "?" + row.list;
    groups.push(...row.groups);
  }

  return {
    list,
    groups,
  };
}

function calculateArrangements(list: string, groups: number[]): number {
  if (groups.length === 0) {
    return list.includes("#") ? 0 : 1;
  }
  const serializedInput = serialize(list, groups);
  const cached = cache.get(serializedInput);
  if (cached !== undefined) {
    return cached;
  }

  const currentGroup = groups.shift() ?? 0;
  const spaceToLeaveOpen =
    groups.reduce((acc, current) => acc + current, 0) + groups.length;
  const firstHashIndex = list.indexOf("#");
  const searchUntil = Math.min(
    firstHashIndex === -1 ? Infinity : firstHashIndex,
    list.length - currentGroup - spaceToLeaveOpen,
  );

  let result = 0;
  for (let startAt = 0; startAt <= searchUntil; ++startAt) {
    if (groupCanStartAt(list, currentGroup, startAt)) {
      result += calculateArrangements(
        list.substring(startAt + currentGroup + 1),
        [...groups],
      );
    }
  }

  cache.set(serializedInput, result);
  return result;
}

function groupCanStartAt(
  list: string,
  currentGroup: number,
  startAt: number,
): boolean {
  return (
    (startAt === 0 || list[startAt - 1] !== "#") &&
    !list.substring(startAt, startAt + currentGroup).includes(".") &&
    list[startAt + currentGroup] !== "#"
  );
}

function cleanup(list: string): string {
  // remove multiple dots
  // remove dots at ends
  return list.replaceAll(/(\.+)/g, ".").replace(/^(\.+)?(.*?)(\.+)?$/, "$2");
}

function lineToRow(line: string): Row {
  const split = line.split(" ");
  return {
    list: split[0],
    groups: split[1].split(",").map((n) => parseInt(n)),
  };
}

async function readInput(file: string): Promise<Row[]> {
  const input = (await Bun.file(file).text()).trim();

  return input.split("\n").map((line) => lineToRow(line));
}

function serialize(list: string, groups: number[]): string {
  return `${list}_${groups.join(",")}`;
}
