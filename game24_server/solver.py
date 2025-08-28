from enum import Enum
import logging
import math
import operator
import itertools
import sys

TARGET = 24
MATH_OPERATORS = (operator.add, operator.sub, operator.mul, operator.truediv)
OPERATOR_MAP = {
    operator.add: "+",
    operator.sub: "-",
    operator.mul: "*",
    operator.truediv: "/",
}
OPERATOR_PRECEDENCE = {
    operator.add: 1,
    operator.sub: 1,
    operator.mul: 2,
    operator.truediv: 2,
}


logger = logging.getLogger(__name__)


class Operand:
    def __init__(self, value, index):
        self.value = value
        self.index = index
        self.precedence = 99  # Default precedence for operands

    def __str__(self):
        return str(self.value)

    def __repr__(self):
        return f"{self.value}"

    def __hash__(self):
        return hash((self.value, self.index))

    def __eq__(self, other):
        return isinstance(other, Operand) and self.value == other.value and self.index == other.index


class Expression:
    def __init__(self, operand1, operand2, op):
        self.operand1 = operand1
        self.operand2 = operand2
        self.op = op
        self.index = operand1.index
        try:
            self.value = op(operand1.value, operand2.value)
        except ZeroDivisionError:
            self.value = None
        self.precedence = OPERATOR_PRECEDENCE[op]

    def __str__(self):
        if self.operand1.precedence < self.precedence:
            result = f"({self.operand1})"
        else:
            result = str(self.operand1)
        result += f"{OPERATOR_MAP[self.op]}"
        if self.operand2.precedence <= self.precedence:
            result += f"({self.operand2})"
        else:
            result += str(self.operand2)
        return result

    def __repr__(self):
        return f"({repr(self.operand1)}{OPERATOR_MAP[self.op]}{repr(self.operand2)})"

    def __hash__(self):
        return hash((self.operand1, self.operand2, self.op))

    def __eq__(self, other):
        if not isinstance(other, Expression):
            return False
        return (
            self.operand1 == other.operand1
            and self.operand2 == other.operand2
            and self.op == other.op
        )

    def should_skip(self):
        # Skip division if denomenator is 0
        if (self.op == operator.truediv) and (self.operand2.value == 0):
            logger.debug(f"Skipping division by zero: {self}")
            return True

        # Skip 1-(2+3), as it is equivalent to (1-2)+3. So does 1/(2*3), which is equivalent to (1/2)/3.
        if self.precedence == self.operand2.precedence:
            logger.debug(f"Skipping expression with same precedence: {self}")
            return True

        # Skip 2+1, as it is equivalent to 1+2. For 3+3, its reverse is same, thus will be skipped by expr duplications.
        if ((self.op == operator.add) or (self.op == operator.mul)) and (
            self.operand1.index > self.operand2.index
        ):
            logger.debug(
                f"Skipping add or mul expressions when operand1 index > operand2 index: {self}"
            ),
            return True

        # Skip n-0 or n/1, as they are equivalent to n+0 and n*1, respectively.
        if (self.op == operator.sub) and (self.operand2.value == 0):
            logger.debug(f"Skipping subtraction of zero: {self}")
            return True

        if (self.op == operator.truediv) and (self.operand2.value == 1):
            logger.debug(f"Skipping division by one: {self}")
            return True

        # Skip (1*3)*2, as it's equivalent to (1*2)*3
        if (
            isinstance(self.operand1, Expression)
            and (self.operand1.precedence == self.precedence)
            and (self.operand1.operand2.index > self.operand2.index)
        ):
            logger.debug(
                f"Skipping expression whose operand1 is expression, with same precedence, and operand1.operand2 has larger index: {self}"
            )
            return True

        return False


class Solver:
    def __init__(self):
        self.solutions = set()
        self._expr_duplicates = set()

    def _try_expression(self, operands):
        if len(operands) == 1:
            if math.isclose(operands[0].value, TARGET):
                self.solutions.add(str(operands[0]))
                logger.info(f"Found solution: {operands[0]}")
            return

        for operand_permutation in itertools.permutations(operands):
            logger.debug(
                f"Permutation {len(operand_permutation)}: {operand_permutation}"
            )
            for op in MATH_OPERATORS:
                expr = Expression(operand_permutation[0], operand_permutation[1], op)
                if self._should_skip(expr):
                    logger.debug(f"Skipping expression: {expr}")
                    continue
                new_operands = [expr]
                new_operands.extend(operand_permutation[2:])                
                self._try_expression(new_operands)                
                self._expr_duplicates.add(expr)
                logger.debug(f"Added expression to duplicates: {expr}")

    def _should_skip(self, expr):
        return expr.should_skip() or (expr in self._expr_duplicates)

    def solve(self, numbers):
        numbers = sorted(numbers)
        operands = [
            Operand(int(number), index) for (index, number) in enumerate(numbers)
        ]
        self._try_expression(operands)


def solve(numbers):
    solver = Solver()
    solver.solve(numbers)
    return solver.solutions


def main():
    numbers = [int(arg) for arg in sys.argv[1:]] 
    print(f"Solving for numbers: {numbers}")   
    print(solve(numbers))

if __name__ == "__main__":
    main()
