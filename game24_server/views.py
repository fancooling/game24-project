import logging
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .solver import solve

logger = logging.getLogger(__name__)

# Create your views here.
@api_view(["GET"])
def solve_game24(request, numbers_str):
    """
    API view to solve the 24 game.
    Expects a GET request with a comma-separated string of 4 numbers.
    Example: /game24/solve/1,2,3,4/
    """

    # 1. Parse and Validate Input
    try:
      logger.info(f"Solving for input: {numbers_str}");
      numbers = [int(n) for n in numbers_str.split(',')]
      if len(numbers) != 4:
        raise ValueError("Input must contain exactly four numbers.")
      
      # 2. Call the Solver Logic
      solutions = solve(numbers)

      # 3. Format and Return the Response
      response_data = {
        "input": numbers,
        "solution_count": len(solutions),
        "solutions": sorted(list(solutions)),
      }

      return Response(response_data, status=status.HTTP_200_OK)
    except (ValueError, TypeError) as e:
    # If parsing fails or input is bad, return a 400 Bad Request
      error_data = {
        "error": "Invalid input.",
        "detail": f"Please provide four comma-separated integers. Details: {e}"
      }
      return Response(error_data, status=status.HTTP_400_BAD_REQUEST)
