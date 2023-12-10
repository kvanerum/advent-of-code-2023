const input = await readInput("input.txt");

console.log(
  input
    .map((entry) => extrapolateFuture(entry))
    .reduce((acc, current) => acc + current, 0),
);

console.log(
  input
    .map((entry) => extrapolateHistory(entry))
    .reduce((acc, current) => acc + current, 0),
);

function extrapolateFuture(sequence: number[]): number {
  const steps = calculateSteps(sequence);

  steps[steps.length - 1].push(0);

  for (let stepIndex = steps.length - 2; stepIndex >= 0; --stepIndex) {
    const nextStep = steps[stepIndex + 1];
    const lastOfNextStep = nextStep[nextStep.length - 1];
    steps[stepIndex].push(
      steps[stepIndex][steps[stepIndex].length - 1] + lastOfNextStep,
    );
  }

  return steps[0].pop() ?? 0;
}

function extrapolateHistory(sequence: number[]): number {
  const steps = calculateSteps(sequence);

  steps[steps.length - 1].unshift(0);

  for (let stepIndex = steps.length - 2; stepIndex >= 0; --stepIndex) {
    const nextStep = steps[stepIndex + 1];
    const firstOfNextStep = nextStep[0];
    steps[stepIndex].unshift(steps[stepIndex][0] - firstOfNextStep);
  }

  return steps[0][0] ?? 0;
}

function calculateSteps(sequence: number[]): number[][] {
  const steps = [sequence];

  while (!steps[steps.length - 1].every((n) => n === 0)) {
    const previousStep = steps[steps.length - 1];
    const step = [];

    for (let i = 0; i < previousStep.length - 1; ++i) {
      step.push(previousStep[i + 1] - previousStep[i]);
    }

    steps.push(step);
  }

  return steps;
}

async function readInput(file: string): Promise<number[][]> {
  const input = (await Bun.file(file).text()).trim();

  return input
    .split("\n")
    .map((line) => line.split(" ").map((n) => parseInt(n)));
}
