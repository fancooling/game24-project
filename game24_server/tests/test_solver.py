import unittest
import logging
import os
from game24_server.solver import solve


# This function runs once before any tests in this module
def setUpModule():
    """Configure module-level logging."""
    # Read the LOG_LEVEL environment variable; default to 'INFO' if not set
    log_level_str = os.environ.get("LOG_LEVEL", "INFO").upper()

    # Ensure the log level is a valid one
    if not hasattr(logging, log_level_str):
        log_level_str = "INFO"  # Default to INFO if an invalid level is provided

    log_level = getattr(logging, log_level_str)

    # Configure the root logger
    logging.basicConfig(level=log_level)
    logging.info(f"Logging configured with level: {log_level_str}")


class TestSolver(unittest.TestCase):
    def test_simple(self):
        solutions = solve([1, 2, 3, 4])
        logging.info(f"Solutions found: {solutions}")
        expected = sorted(["(1+2+3)*4", "1*2*3*4", "(1+3)*(2+4)"])
        self.assertListEqual(sorted(solutions), expected)

    def test_hard(self):
        solutions = solve([5, 5, 5, 1])
        logging.info(f"Solutions found: {solutions}")
        # TODO: Add more de-dup logic to fix the solver.
        expected = sorted(["(5-1/5)*5", "5*(5-1/5)"])
        self.assertListEqual(sorted(solutions), expected)

        solutions = solve([3, 3, 8, 8])
        logging.info(f"Solutions found: {solutions}")
        expected = ["8/(3-8/3)"]
        self.assertListEqual(sorted(solutions), expected)


if __name__ == "__main__":
    unittest.main()
