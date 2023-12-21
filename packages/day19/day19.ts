interface Range {
  from: number;
  to: number;
}

interface Input {
  rules: Map<string, Rule[]>;
  parts: Array<Map<string, number>>;
}

interface Rule {
  register?: string;
  operand?: string;
  param?: number;
  action: string;
}

const input = await readInput("input.txt");

console.log(
  input.parts
    .filter((part) => isAccepted(part, input.rules))
    .map((part) =>
      [...part.values()].reduce((acc, current) => acc + current, 0),
    )
    .reduce((acc, current) => acc + current, 0),
);

console.log(countAccepted("in", input.rules, globalRange()));

function countAccepted(
  ruleLabel: string,
  ruleMap: Map<string, Rule[]>,
  ranges: Map<string, Range[]>,
): number {
  const rules = ruleMap.get(ruleLabel) ?? [];

  let acceptedCount = 0;
  let currentRanges = ranges;

  for (const rule of rules) {
    if (rule.register === undefined && rule.action === "A") {
      return acceptedCount + calculateRangesSize(currentRanges);
    } else if (rule.register === undefined && rule.action === "R") {
      return acceptedCount;
    } else if (rule.register === undefined) {
      return acceptedCount + countAccepted(rule.action, ruleMap, currentRanges);
    }

    const split = splitRanges(currentRanges, rule);

    if (rule.action === "A") {
      acceptedCount += calculateRangesSize(split[0]);
    } else if (rule.action !== "R") {
      acceptedCount += countAccepted(rule.action, ruleMap, split[0]);
    }

    currentRanges = split[1];
  }

  return acceptedCount;
}

function calculateRangesSize(ranges: Map<string, Range[]>): number {
  return [...ranges.values()]
    .map((r) =>
      r
        .map((v) => v.to - v.from + 1)
        .reduce((acc, current) => acc + current, 0),
    )
    .reduce((acc, current) => acc * current, 1);
}

function splitRanges(
  ranges: Map<string, Range[]>,
  rule: Rule,
): [Map<string, Range[]>, Map<string, Range[]>] {
  const acceptedMap = new Map();
  const rejectedMap = new Map();

  for (const char of ranges.keys()) {
    if (rule.register === char) {
      acceptedMap.set(char, []);
      rejectedMap.set(char, []);
      for (const range of ranges.get(char) ?? []) {
        if (rule.operand === ">") {
          if (range.from > (rule.param ?? 0)) {
            acceptedMap.get(char).push({
              from: range.from,
              to: range.to,
            });
          } else if (range.to < (rule.param ?? 0)) {
            rejectedMap.get(char).push({
              from: range.from,
              to: range.to,
            });
          } else {
            acceptedMap.get(char).push({
              from: (rule.param ?? 0) + 1,
              to: range.to,
            });
            rejectedMap.get(char).push({
              from: range.from,
              to: rule.param,
            });
          }
        } else {
          if (range.to < (rule.param ?? 0)) {
            acceptedMap.get(char).push({
              from: range.from,
              to: range.to,
            });
          } else if (range.from > (rule.param ?? 0)) {
            rejectedMap.get(char).push({
              from: range.from,
              to: range.to,
            });
          } else {
            acceptedMap.get(char).push({
              from: range.from,
              to: (rule.param ?? 0) - 1,
            });
            rejectedMap.get(char).push({
              from: rule.param,
              to: range.to,
            });
          }
        }
      }
    } else {
      acceptedMap.set(char, cloneRanges(ranges.get(char) ?? []));
      rejectedMap.set(char, cloneRanges(ranges.get(char) ?? []));
    }
  }

  return [acceptedMap, rejectedMap];
}

function cloneRanges(ranges: Range[]): Range[] {
  return ranges.map((r) => ({
    from: r.from,
    to: r.to,
  }));
}

function globalRange(): Map<string, Range[]> {
  const result = new Map();

  "xmas".split("").map((c) =>
    result.set(c, [
      {
        from: 1,
        to: 4000,
      },
    ]),
  );

  return result;
}

function isAccepted(
  part: Map<string, number>,
  rules: Map<string, Rule[]>,
): boolean {
  let currentRuleLabel = "in";

  while (currentRuleLabel !== "A" && currentRuleLabel !== "R") {
    const currentRule = rules.get(currentRuleLabel);

    if (currentRule === undefined) {
      throw new Error("rule does not exist");
    }

    for (const subRule of currentRule) {
      if (subRule.register === undefined) {
        currentRuleLabel = subRule.action;
        break;
      } else if (
        subRule.operand === ">" &&
        (part.get(subRule.register) ?? 0) > (subRule.param ?? 0)
      ) {
        currentRuleLabel = subRule.action;
        break;
      } else if (
        subRule.operand === "<" &&
        (part.get(subRule.register) ?? 0) < (subRule.param ?? 0)
      ) {
        currentRuleLabel = subRule.action;
        break;
      }
    }
  }

  return currentRuleLabel === "A";
}

function parseRules(lines: string): Map<string, Rule[]> {
  const result = new Map<string, Rule[]>();

  lines.split("\n").forEach((line) => {
    const firstPar = line.indexOf("{");
    const label = line.substring(0, firstPar);
    const rules = line
      .substring(firstPar + 1, line.length - 1)
      .split(",")
      .map((rule) => parseRule(rule));

    result.set(label, rules);
  });

  return result;
}

function parseRule(rule: string): Rule {
  const doublePointIndex = rule.indexOf(":");

  if (doublePointIndex > -1) {
    return {
      action: rule.substring(doublePointIndex + 1),
      register: rule.substring(0, 1),
      operand: rule.substring(1, 2),
      param: parseInt(rule.substring(2, doublePointIndex)),
    };
  } else {
    return { action: rule };
  }
}

function parseParts(lines: string): Array<Map<string, number>> {
  return lines.split("\n").map((line) => {
    const map = new Map<string, number>();
    line
      .substring(1, line.length - 1)
      .split(",")
      .forEach((v) => {
        map.set(v.substring(0, 1), parseInt(v.substring(2)));
      });

    return map;
  });
}

async function readInput(file: string): Promise<Input> {
  const input = (await Bun.file(file).text()).trim();

  const split = input.split("\n\n");

  return {
    rules: parseRules(split[0]),
    parts: parseParts(split[1]),
  };
}
