const TARGET = 24;
const EPSILON = 1e-9;

export type Op = '+' | '-' | '*' | '/';

const OPS: readonly Op[] = ['+', '-', '*', '/'];

const PRECEDENCE: Record<Op, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

function apply(op: Op, a: number, b: number): number {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return a / b;
  }
}

class Operand {
  readonly precedence = 99;
  constructor(
    readonly value: number,
    readonly index: number,
  ) {}

  toString(): string {
    return String(this.value);
  }
}

class Expression {
  readonly value: number;
  readonly precedence: number;
  readonly index: number;

  constructor(
    readonly operand1: Node,
    readonly operand2: Node,
    readonly op: Op,
  ) {
    this.precedence = PRECEDENCE[op];
    this.index = operand1.index;
    this.value =
      op === '/' && operand2.value === 0 ? NaN : apply(op, operand1.value, operand2.value);
  }

  toString(): string {
    let result: string;
    if (this.operand1.precedence < this.precedence) {
      result = `(${this.operand1})`;
    } else {
      result = String(this.operand1);
    }
    result += this.op;
    if (this.operand2.precedence <= this.precedence) {
      result += `(${this.operand2})`;
    } else {
      result += String(this.operand2);
    }
    return result;
  }

  shouldSkip(): boolean {
    if (this.op === '/' && this.operand2.value === 0) {
      return true;
    }

    if (this.precedence === this.operand2.precedence) {
      return true;
    }

    if ((this.op === '+' || this.op === '*') && this.operand1.index > this.operand2.index) {
      return true;
    }

    if (this.op === '-' && this.operand2.value === 0) {
      return true;
    }

    if (this.op === '/' && this.operand2.value === 1) {
      return true;
    }

    if (this.operand1 instanceof Expression && this.operand1.precedence === this.precedence) {
      if (this.operand1.operand2.index > this.operand2.index) {
        return true;
      }
      if ((this.op === '+' || this.op === '*') && this.operand1.index > this.operand2.index) {
        return true;
      }
    }

    return false;
  }
}

type Node = Operand | Expression;

function* permutations<T>(arr: readonly T[]): Generator<T[]> {
  if (arr.length <= 1) {
    yield arr.slice();
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      yield [arr[i], ...perm];
    }
  }
}

function tryExpression(operands: readonly Node[], solutions: Set<string>): void {
  if (operands.length === 1) {
    if (Math.abs(operands[0].value - TARGET) < EPSILON) {
      solutions.add(String(operands[0]));
    }
    return;
  }

  const permDedup = new Set<string>();
  for (const perm of permutations(operands)) {
    const key = perm.map((o) => o.value).join(',');
    if (permDedup.has(key)) {
      continue;
    }
    permDedup.add(key);

    for (const op of OPS) {
      const expr = new Expression(perm[0], perm[1], op);
      if (expr.shouldSkip()) {
        continue;
      }
      tryExpression([expr, ...perm.slice(2)], solutions);
    }
  }
}

export function solve(numbers: readonly number[]): string[] {
  const sorted = [...numbers].sort((a, b) => a - b);
  const operands: Node[] = sorted.map((n, i) => new Operand(Math.trunc(n), i));
  const solutions = new Set<string>();
  tryExpression(operands, solutions);
  return [...solutions].sort();
}
