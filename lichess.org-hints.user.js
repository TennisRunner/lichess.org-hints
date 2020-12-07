// ==UserScript==
// @name     lichess.org hints
// @version  1
// @include https://lichess.org/*
// @require https://code.jquery.com/jquery-3.1.1.js
// ==/UserScript==


const PIECES_TYPE = 
{
	NONE:"NONE",
	PAWN:"PAWN",
	ROOK:"ROOK",
	KNIGHT:"KNIGHT",
	BISHOP:"BISHOP",
	QUEEN:"QUEEN",
	KING:"KING"
}

const TEAM = 
{
	NONE:"NONE",
	BLACK:"BLACK",
	WHITE:"WHITE"
}

const TILE_TYPE =
{
	NONE:"NONE",
	SAFE:"SAFE",
	DANGER:"DANGER",
	DANGER_OCCUPIED:"DANGER-OCCUPIED",
	VICTIM:"VICTIM"
}

const DIRECTIONS = 
{
	UP:[0, -1],
	DOWN:[0, 1],
	LEFT:[-1, 0],
	RIGHT:[1, 0],

	DIAGONALS:
	[
		[1, 1],
		[-1, 1],
		[1,-1],
		[-1,-1]
	],

	KNIGHTS:
	[
		[2, 1],
		[-2, -1],
		[-2, 1],
		[2, -1],

		[1, 2],
		[-1, -2],
		[-1, 2],
		[1, -2]
	]
}


class ChessBoard
{
	constructor()
	{
		this.TOTAL_TILES = 64;
		this.ROW_SIZE = 8;

		this.pieces = Array();

		this.resetPieces();
	}


	isIndexInBounds(x, y)
	{
		return x >= 0 && x < this.ROW_SIZE && y >= 0 && y < this.ROW_SIZE;
	}


	traceMovement(x, y, offsetX, offsetY, callback)
	{
		while(true)
		{
			x += offsetX;
			y += offsetY;

			if(this.isIndexInBounds(x, y) == false)
				break;

			let piece = this.getPiece(x, y);

			let res = callback(x, y, piece);

			if(piece != null || res == false)
				break;
		}
	}

	getPieceAttackTiles(piece, friendlyFire = false)
	{
		let results = Array();

		let directions = null;

		switch(piece.type)
		{
			case PIECES_TYPE.PAWN:

				let modifier = 1;

				if(piece.team == TEAM.BLACK)
					modifier = -1;

				directions = [DIRECTIONS.DIAGONALS[2], DIRECTIONS.DIAGONALS[3]];

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0] * modifier, direction[1] * modifier, (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;

							results.push(el);
						}

						return false;
					});
				}

			break;

			case PIECES_TYPE.ROOK:

				directions = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.DOWN];

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0], direction[1], (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;
						}

						results.push(el);
					});
				}

			break;

			case PIECES_TYPE.BISHOP:

				directions = DIRECTIONS.DIAGONALS;

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0], direction[1], (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;
						}

						results.push(el);
					});
				}

			break;

			case PIECES_TYPE.KNIGHT:

				directions = DIRECTIONS.KNIGHTS;

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0], direction[1], (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;
						}

						results.push(el);

						return false;
					});
				}

			break;

			case PIECES_TYPE.QUEEN:

				directions = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.DOWN, ...DIRECTIONS.DIAGONALS]

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0], direction[1], (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;
						}

						results.push(el);
					});
				}

			break;

			case PIECES_TYPE.KING:

				directions = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT, DIRECTIONS.UP, DIRECTIONS.DOWN, ...DIRECTIONS.DIAGONALS]

				for(let direction of directions)
				{
					this.traceMovement(piece.x, piece.y, direction[0], direction[1], (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
						{
							if(targetPiece.team != piece.team)
								el.type = TILE_TYPE.VICTIM;
							else if(friendlyFire == false)
								return;
						}

						results.push(el);

						return false;
					});
				}

			break;

			
		}

		return results;
	}

	getPieceMovementTiles(piece)
	{
		let results = Array();

		let directions = null;

		switch(piece.type)
		{
			case PIECES_TYPE.PAWN:

				let modifier = 1;

				if(piece.team == TEAM.BLACK)
					modifier = -1;

				directions = [DIRECTIONS.UP];

				for(let direction of directions)
				{
					let maxDistance = 1;
					let movementCount = 0;

					if(piece.y == 1 && piece.team == TEAM.WHITE)
						maxDistance = 2
					else if(piece.y == 6 && piece.team == TEAM.BLACK)
						maxDistance = 2;

					this.traceMovement(piece.x, piece.y, direction[0] * modifier, direction[1] * modifier, (x, y, targetPiece) =>
					{
						let el = {
							x: x,
							y: y,
							type: TILE_TYPE.NONE
						};

						if(targetPiece != null)
							return;

						results.push(el);

						if(movementCount++ >= maxDistance)
							return false;
					});
				}
			break;

			case PIECES_TYPE.ROOK:
				results = this.getPieceAttackTiles(piece);
			break;

			case PIECES_TYPE.PAWN:					
				break;

			case PIECES_TYPE.BISHOP:
				results = this.getPieceAttackTiles(piece);
			break;

			case PIECES_TYPE.KNIGHT:
				results = this.getPieceAttackTiles(piece);
			break;

			case PIECES_TYPE.QUEEN:
				results = this.getPieceAttackTiles(piece);
			break;

			case PIECES_TYPE.KING:
				results = this.getPieceAttackTiles(piece);
			break;
		}

		return results;
	}

	getPieceMovementTilesWithHints(piece)
	{
		let pieceMovementTiles = this.getPieceAttackTiles(piece);
		
		pieceMovementTiles = pieceMovementTiles.concat(this.getPieceMovementTiles(piece));

		// let pieceMovementTiles = this.getPieceMovementTiles(piece);

		let enemyMovementTiles = Array();

		let enemyPieces = this.pieces.filter(x => x.team != piece.team);

		for(let enemyPiece of enemyPieces)
			enemyMovementTiles = enemyMovementTiles.concat(this.getPieceAttackTiles(enemyPiece, true));

		for(let tile of pieceMovementTiles)
		{
			if(tile.type == TILE_TYPE.NONE)
				tile.type = TILE_TYPE.SAFE;

			if(enemyMovementTiles.filter(x => x.x == tile.x && x.y == tile.y).length > 0)
				tile.type = TILE_TYPE.DANGER;
		}
		
		return pieceMovementTiles;
	}

	getPiecesInDanger(team)
	{
		let enemyPieces = this.pieces.filter(x => x.team != team);
		
		let enemyMovementTiles = Array();

		for(let enemyPiece of enemyPieces)
			enemyMovementTiles = enemyMovementTiles.concat(this.getPieceAttackTiles(enemyPiece));

		return enemyMovementTiles.filter(x => x.type == TILE_TYPE.VICTIM);
	}

	getPiecesUnprotected(team)
	{
		let pieces = this.pieces.filter(x => x.team == team);
		
		let attackTiles = Array();

		for(let piece of pieces)
			attackTiles = attackTiles.concat(this.getPieceAttackTiles(piece));


		let enemyPieces = this.pieces.filter(x => x.team != team);
		let enemyMovementTiles = Array();

		for(let enemyPiece of enemyPieces)
			enemyMovementTiles = enemyMovementTiles.concat(this.getPieceAttackTiles(enemyPiece, true));

		// filter the tiles
		attackTiles = attackTiles.filter((tile) => 
		{
			return enemyMovementTiles.filter(tile2 => {
				return tile.x == tile2.x && tile.y == tile2.y;
			}).length == 0;			
		});

		attackTiles = attackTiles.filter(x => x.type == TILE_TYPE.VICTIM);

		return attackTiles;

		// return enemyMovementTiles.filter(x => x.type == TILE_TYPE.VICTIM);
	}

	resetPieces()
	{
		this.pieces = Array();
	}

	addPiece(x, y, type, team)
	{
		let piece = 
		{
			x: x,
			y: y,
			type: type,
			team: team
		}

		this.pieces.push(piece);
	}

	getPiece(x, y)
	{
		return this.pieces.filter(piece => piece.x == x && piece.y == y)[0];
	}

	print()
	{
		let output = "";

		for(let y = 0; y < 8; y++)
		{
			for(let x = 0; x < 8; x++)
			{
				let piece = this.getPiece(x, y);

				output += piece.team[0] + piece.type[0] + ",";
			}

			output += "\r\n";
		}

		console.log(output);
	}
}




class Game
{
	constructor()
	{
		$("head").append(`
		<style>
			.main-board cg-board piece.test{
				background-color:rgba(255, 0, 0, 0.5);
			}

			#tile-container{
				z-index:1;
				position:absolute;
				width:100%;
				height:100%;
			}

			#tile-container .tile{
				display:inline-block;
				width:12.5%;
				height:12.5%;
				box-sizing:border-box;
			}

			#tile-container .tile .dot{
				width:50px;
				height:50px;
				margin:0px auto;

				position: relative;
				top: 50%;
				transform: translateY(-50%);
			}

			#tile-container .tile.safe .dot{

				/*background-color:rgb(255, 82, 82);*/
			}



			#tile-container .tile.none{
				display:inline-block !important;
			}

			#tile-container .tile.danger{
				background:radial-gradient(rgba(255, 20, 20,0.5) 19%, rgba(0,0,0,0) 20%);
			}

			#tile-container .tile.danger-occupied{
				background:radial-gradient(transparent 0%, transparent 80%, rgba(255, 20, 20,0.5) 80%);
			}

			#tile-container .tile.victim{
				background:radial-gradient(transparent 0%, transparent 80%, rgba(20,85,0,0.3) 80%);
			}

			#tile-container .tile.safe{
				background:radial-gradient(rgba(20,85,30,0.5) 19%, rgba(0,0,0,0) 20%)
				

				/*background-color:rgb(82, 163, 255);*/
			}
		</style>
		`);
		
		this.TOTAL_TILES = 64;
		this.ROW_SIZE = 8;

		this.cgBoard = $(".main-board cg-board");
		this.tileContainer = $("<div id=\"tile-container\"></div>");
		this.cgBoard.prepend(this.tileContainer);

		for(let i = 0; i < this.TOTAL_TILES; i++)
			this.tileContainer.append(`<div class="tile"><div class="dot"></div></div>`);


		this.chessBoard = new ChessBoard();
	}

	getLocalTeam()
	{
		return $(".orientation-white").length > 0 ? TEAM.WHITE : TEAM.BLACK;
	}

	getEnemyTeam()
	{
		return $(".orientation-white").length > 0 ? TEAM.BLACK : TEAM.WHITE;
	}

	predict(x, y)
	{
		this.refreshPieces();
		this.resetTiles();

		let myTilesInDanger = this.chessBoard.getPiecesInDanger(this.getLocalTeam());

		for(let tile of myTilesInDanger)
		{
			if(tile.type == TILE_TYPE.VICTIM)
				tile.type = TILE_TYPE.DANGER;

			if(tile.type == TILE_TYPE.DANGER && this.chessBoard.getPiece(tile.x, tile.y) != null)
			{
				tile.type = TILE_TYPE.DANGER_OCCUPIED;
			}

			this.setTile(tile.x, tile.y, tile.type);
		}


		let myVictims = this.chessBoard.getPiecesUnprotected(this.getLocalTeam());

		for(let tile of myVictims)
		{
			this.setTile(tile.x, tile.y, tile.type);
		}



		let piece = this.chessBoard.getPiece(x, y);
		

		if(piece == null)
			return;

		
		this.resetTiles();

		let tiles = this.chessBoard.getPieceMovementTilesWithHints(piece);

		
		console.log("Tiles", tiles);

		for(let tile of tiles)
		{
			if(tile.type == TILE_TYPE.DANGER && this.chessBoard.getPiece(tile.x, tile.y) != null)
			{
				tile.type = TILE_TYPE.DANGER_OCCUPIED;
			}

			this.setTile(tile.x, tile.y, tile.type);
		}
	}

	refreshPieces()
	{
		this.chessBoard.resetPieces();

		for(let el of this.cgBoard.find("piece"))
		{
			el = $(el);

			let pos = this.positionToIndex(el.position().left, el.position().top);
			
			let classes = el.attr("class").split(/\s+/);

			let pieceType = classes.filter(x => Object.values(PIECES_TYPE).indexOf(x.toUpperCase()) != -1)[0].toUpperCase();

			let pieceTeam = classes.indexOf("black") != -1 ? TEAM.BLACK : TEAM.WHITE;

			this.chessBoard.addPiece(pos[0], pos[1], pieceType, pieceTeam);
		}
	}

	setTile(x, y, type)
	{
		let tile = $(this.tileContainer.children().get(x + y * this.ROW_SIZE));

		tile.removeClass().addClass("tile");

		tile.addClass(type.toLowerCase());
	}

	resetTiles()
	{
		for(let y = 0; y < this.ROW_SIZE; y++)
		{
			for(let x = 0; x < this.ROW_SIZE; x++)
			{
				this.setTile(x, y, TILE_TYPE.NONE);
			}
		}
	}

	positionToIndex(x, y)
	{
		let tileWidth = this.getTileWidth();

		x = parseInt((x + 1) / tileWidth);
		y = parseInt((y + 1) / tileWidth);

		x = Math.min(x, 7);
		y = Math.min(y, 7);

		return [x, y];
	}

	getTileWidth()
	{
		return this.cgBoard.width() / this.ROW_SIZE;
	}
}



$(document).ready(function()
{
	let game = new Game();

	let lastPos = [-1, -1];

	$(document).on("mousemove", "cg-board", function(e)
	{
		let el = $(this);
		
		let offset = el.offset();


		let pos = game.positionToIndex(e.clientX - offset.left, e.clientY - offset.top);


		if(lastPos[0] != pos[0] || lastPos[1] != pos[1])
		{
			lastPos[0] = pos[0];
			lastPos[1] = pos[1];

			console.log("Predicting");
		
			game.predict(pos[0], pos[1]);
		}

	
	});

});
