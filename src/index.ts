import { Chess, PieceSymbol } from 'chess.js';

interface MoveScore {
	move: string;
	score: number;
}

export default {
	async fetch(request: Request): Promise<Response> {
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight request
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*', 
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		if (request.method === 'POST') {
			const requestBody = await request.text();

			try {
				// Initialize chess.js with the given FEN string
				const chess = new Chess(requestBody);

				if (chess.isGameOver()) {
					return new Response(`Game over!`, {
						status: 400,
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				function shuffleMoves(moves: MoveScore[]): MoveScore[] {
					for (let i = moves.length - 1; i > 0; i--) {
						const j = Math.floor(Math.random() * (i + 1));
						[moves[i], moves[j]] = [moves[j], moves[i]];
					}
					return moves;
				}

				const moves: MoveScore[] = chess.moves({ verbose: true }).map(move => {
					// Score moves
					let score = 0;

					const tempChess = new Chess(move.after);
					const pieceFrom = chess.get(move.from);
					const pieceTo = chess.get(move.to);

					const pieceScores: Record<PieceSymbol, number> = {
						"p": 1,
						"n": 3,
						"b": 3,
						"r": 5,
						"q": 9,
						"k": 20
					}

					if (move.san.includes('#')) score += 100;
					if (move.san.includes('+')) score += 0.3;
					if (move.san.includes('O-O')) score += 0.25;
					if (move.promotion) score += 0.27;
					if (move.piece === "k") score -= 0.2;

					// Capture logic
					if (pieceFrom && pieceTo) {
						console.log(`${pieceFrom} -> ${pieceTo} = ${pieceScores[pieceFrom.type]} -> ${pieceScores[pieceTo.type]}`)
						if (pieceScores[pieceFrom.type] <= pieceScores[pieceTo.type]) 
							score += (pieceScores[pieceFrom.type] - pieceScores[pieceTo.type]) / 5;
						else
							score -= (pieceScores[pieceFrom.type] - pieceScores[pieceTo.type]) / 5;
					}

					// Hung material logic
					else if (chess.isAttacked(move.from, move.color === "w" ? "b" : "w") && !chess.isAttacked(move.from, move.color))
						score += pieceScores[pieceFrom.type] / 5;
					
					return {
						move: move.san,
						score: score
					}
				});

				console.log(moves);
				
				const highestScore = Math.max(...moves.map(x => x.score));
				const chosenMove = moves.filter((x) => x.score == highestScore);
				
				console.log(chosenMove);
				chess.move(shuffleMoves(chosenMove)[0].move);

				// Return the new FEN string
				return new Response(chess.fen(), {
					status: 200,
					headers: {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (e) {
				return new Response(`${e}`, {
					status: 400,
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		// Return error for unsupported methods
		return new Response(`Bad request. ${request.method}`, {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	},
} satisfies ExportedHandler;
