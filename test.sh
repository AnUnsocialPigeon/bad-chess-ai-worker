#!/bin/bash

# Initial FEN string (standard starting position in chess)
FEN="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
URL="http://localhost:8787"  # Your Cloudflare Worker URL here

# Loop for 5 moves
for i in {1..5}
do
  # Send the FEN to the worker and get the response
  FEN=$(curl -X POST -d "$FEN" $URL)
  echo "Move $i: $FEN"

  # Check if the game is over (FEN would be invalid in such cases)
  if [[ "$FEN" == "Game over!" ]]; then
    echo "The game has ended."
    break
  fi
done

