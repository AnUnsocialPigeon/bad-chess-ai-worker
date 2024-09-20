import { Chess } from 'chess.js';

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
					return new Response('Game over!', {
						status: 400,
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
					});
				}

				const moves = chess.moves();
				const randomMove = moves[Math.floor(Math.random() * moves.length)];
				chess.move(randomMove);

				// Return the new FEN string
				return new Response(chess.fen(), {
					status: 200,
					headers: {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
					},
				});
			} catch (e) {
				return new Response('Invalid FEN string', {
					status: 400,
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				});
			}
		}

		// Return error for unsupported methods
		return new Response('Bad request.', {
			status: 400,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		});
	},
} satisfies ExportedHandler;
