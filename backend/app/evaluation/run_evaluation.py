#!/usr/bin/env python3
"""Script to run all DeepEval evaluations and generate a report."""

import subprocess
import sys


def main():
    """Run DeepEval tests on all evaluation modules."""
    print("=" * 60)
    print("Running DeepEval Evaluation Pipeline")
    print("=" * 60)

    # Run deepeval tests
    result = subprocess.run(
        ["deepeval", "test", "run", "app/evaluation/", "-v"],
        cwd="/home/fed/Documents/github/agent-assitant/backend",
    )

    if result.returncode == 0:
        print("\n✅ All evaluations passed!")
    else:
        print("\n❌ Some evaluations failed. Check the output above.")

    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
