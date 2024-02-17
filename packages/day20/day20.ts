interface Machine {
  modules: Map<string, Module>;
}

interface PulseAction {
  from: string;
  pulse: Pulse;
  to: string;
}

abstract class Module {
  readonly outputs: string[] = [];
  protected readonly label: string;

  constructor(label: string, outputs: string) {
    this.label = label;
    this.outputs = outputs.split(", ");
  }

  abstract receivePulse(pulse: PulseAction): PulseAction[];

  abstract reset(): void;
}

class FlipFlop extends Module {
  private status = Status.OFF;

  reset(): void {
    this.status = Status.OFF;
  }

  receivePulse(pulse: PulseAction): PulseAction[] {
    if (pulse.pulse === Pulse.HIGH) {
      return [];
    }

    if (this.status === Status.OFF) {
      this.status = Status.ON;
      return this.outputs.map((to) => ({
        from: this.label,
        pulse: Pulse.HIGH,
        to,
      }));
    } else {
      this.status = Status.OFF;
      return this.outputs.map((to) => ({
        from: this.label,
        pulse: Pulse.LOW,
        to,
      }));
    }
  }
}

class Conjunction extends Module {
  private readonly memory = new Map<string, Pulse>();
  private readonly inputs: string[] = [];

  addInput(label: string): void {
    this.inputs.push(label);
  }

  reset(): void {
    this.memory.clear();
  }

  receivePulse(pulse: PulseAction): PulseAction[] {
    this.memory.set(pulse.from, pulse.pulse);

    const pulseToSend = this.inputs
      .map((input) => this.memory.get(input) ?? Pulse.LOW)
      .every((pulse) => pulse === Pulse.HIGH)
      ? Pulse.LOW
      : Pulse.HIGH;

    return this.outputs.map((to) => ({
      from: this.label,
      pulse: pulseToSend,
      to,
    }));
  }
}

class Broadcast extends Module {
  reset(): void {}

  receivePulse(pulse: PulseAction): PulseAction[] {
    return this.outputs.map((to) => ({
      from: this.label,
      pulse: pulse.pulse,
      to,
    }));
  }
}

enum Status {
  ON,
  OFF,
}

enum Pulse {
  LOW,
  HIGH,
}

const input = await readInput("input.txt");

let lowPulsesCount = 0;
let highPulsesCount = 0;

for (let i = 0; i < 1000; ++i) {
  const [low, high] = pushButton(input, i);
  lowPulsesCount += low;
  highPulsesCount += high;
}

console.log(lowPulsesCount * highPulsesCount);

[...input.modules.values()].forEach((m) => {
  m.reset();
});

const trackModules = new Map<string, number[]>([
  ["jf", []],
  ["ks", []],
  ["qs", []],
  ["zk", []],
]);

for (let i = 0; i < 20000; ++i) {
  pushButton(input, i, trackModules);
}

const lcm = [...trackModules.values()]
  .map((v) => v[0])
  .reduce((previous, current) => {
    let result = previous;

    while (result % current !== 0) {
      result += previous;
    }

    return result;
  }, 1);

console.log(lcm);

function pushButton(
  machine: Machine,
  numPush: number,
  trackModules?: Map<string, number[]>,
): [number, number] {
  const pulses: PulseAction[] = [
    {
      from: "button",
      pulse: Pulse.LOW,
      to: "broadcaster",
    },
  ];

  let low = 0;
  let high = 0;

  while (pulses.length > 0) {
    const currentPulse = pulses.shift();

    if (currentPulse === undefined) {
      throw new Error();
    }

    if (
      trackModules !== undefined &&
      currentPulse.to === "hj" &&
      currentPulse.pulse === Pulse.HIGH
    ) {
      const track = trackModules?.get(currentPulse.from);
      if (track !== undefined) {
        track.push(numPush + 1);
      }
    }

    if (currentPulse?.pulse === Pulse.HIGH) {
      high++;
    } else {
      low++;
    }

    const module = machine.modules.get(currentPulse?.to ?? "");

    if (module === undefined || currentPulse === undefined) {
      continue;
    }

    pulses.push(...module.receivePulse(currentPulse));
  }

  return [low, high];
}

async function readInput(file: string): Promise<Machine> {
  const input = (await Bun.file(file).text()).trim();

  const modules = new Map<string, Module>();

  input.split("\n").forEach((line) => {
    const split = line.split(" -> ");

    if (split[0] === "broadcaster") {
      modules.set("broadcaster", new Broadcast("broadcaster", split[1]));
    } else if (split[0].startsWith("%")) {
      const label = split[0].substring(1);
      modules.set(label, new FlipFlop(label, split[1]));
    } else if (split[0].startsWith("&")) {
      const label = split[0].substring(1);
      modules.set(split[0].substring(1), new Conjunction(label, split[1]));
    }
  });

  // add inputs to conjunction modules
  [...modules.entries()]
    .filter(([_, module]) => module instanceof Conjunction)
    .forEach(([label, module]) => {
      [...modules.entries()]
        .filter(([_, module2]) => module2.outputs.includes(label))
        .forEach(([label2, _]) => {
          (module as Conjunction).addInput(label2);
        });
    });

  return { modules };
}
