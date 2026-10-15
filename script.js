const Gameboard = () => {
	const rows = 3;
	const columns = 3;
	const board = [];
	for(let i = 0; i < rows; i++) {
		board[i] = [];
		for(let j = 0; j < columns; j++) {
			board[i].push(Cell());
        }
    }
	
    const getBoard = () => board;
	const printBoard = () => {
        const boardWithCellMarkers =
        board.map(row => {
            return row.map(cell => cell.getMarker());
        });
        console.log(boardWithCellMarkers);
	}

	const markCell = (row, col, marker) => {
        board[row][col].setMarker(marker);
	}

	const isBoardFull = () => {
		const boardRowsWithMarkers = board.map(row => row.map(cell => cell.getMarker()));
		const boardRowsWithEmptyMarkers = boardRowsWithMarkers.filter(row => row.includes(""));
		return boardRowsWithEmptyMarkers.length === 0;
	}

	let winner = null;
	let winningLine = [];
	const getWinner = () => {
		function isSameLine(line) {
			return line.every ( cell => {
				return cell.getMarker() === line[0].getMarker() &&
				cell.getMarker() !== "";
			} );
		}

		for(const row of board) {
			if(isSameLine(row)) {
				winningLine = [...row];
				break;
			}
		}

		for(let j = 0; j < columns; j++) {
			const col = board.map(row => row[j]);
			if(isSameLine(col)) {
				winningLine = [...col];
				break;
			}
		}

		const ltrDiag = [];
		const rtlDiag = [];
		const max_coords = rows;
		for(
			let i = 0, j = max_coords;
			i < max_coords, j > 0;
			i++, j--
		)	{
			ltrDiag.push(board[i][i]);
			rtlDiag.push(board[i][j - 1]);
		}

		if(isSameLine(ltrDiag)) winningLine = [...ltrDiag];
		if(isSameLine(rtlDiag)) winningLine = [...rtlDiag];

		if(winningLine.length > 0) winner = winningLine[0].getMarker();
		else if(isBoardFull()) winner = "Tie";
		return winner;
	}

	return { getBoard, printBoard, markCell, getWinner };
}

const Cell = () => {
	let marker = "";
	const getMarker = () => marker;
	const setMarker = (newMarker) => {marker = newMarker};
	return { getMarker, setMarker };
}

const GameController = () => {
	const board = Gameboard();
	const players =
	[
		{ name: "player1", marker: "X" },
		{ name: "player2", marker: "O" },
	];
	let activePlayer = players[0];
		
	const getActivePlayer = () => activePlayer;
	const switchActivePlayer = () => {
        activePlayer =
        activePlayer === players[0]
        ? players[1]
        : players[0];
    };

    const playTurn = (row, col) => {
		board.markCell(row, col, activePlayer.marker)
		// console.log(`${getActivePlayer().marker} played at coordinate ${row + 1}, ${col + 1}`)
		switchActivePlayer();
        // board.printBoard();
	};

	return { playTurn, getActivePlayer,
		getBoard: board.getBoard,
		getWinner: board.getWinner,
	};
};

const ScreenController = (() => {
	const game = GameController();
	const playerTurnDiv = document.querySelector(".player-turn");
	const boardDiv = document.querySelector(".board");

	const updateScreen = () => {
		const activePlayer = game.getActivePlayer();
		playerTurnDiv.textContent = `${activePlayer.marker}'s turn`;

		const board = game.getBoard();
		boardDiv.textContent = "";
		board.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				const cellButton = document.createElement("button");
				const cellMarker = cell.getMarker();
				cellButton.dataset.row = rowIndex;
				cellButton.dataset.col = colIndex;
				cellButton.dataset.marker = cellMarker;
				boardDiv.appendChild(cellButton);
			});
		});

		const winner = game.getWinner();
		if(winner !== null) {
			let gameOverMessage = "";
			if(winner == "Tie") { gameOverMessage = "It's a tie!"}
			else { gameOverMessage = `${winner} wins!` }
			playerTurnDiv.textContent = gameOverMessage;
		} 
	}

	boardDiv.addEventListener("click", function boardClickHandler(e) {
		const clickedCell = e.target;
		const clickedCellRow = clickedCell.dataset.row;
		const clickedCellColumn = clickedCell.dataset.col;
		if(!clickedCellColumn || !clickedCellRow) return;

		if(clickedCell.dataset.marker === "" && game.getWinner() === null) {
			game.playTurn(Number(clickedCellRow), Number(clickedCellColumn));			
		} else return;

		updateScreen();
	});
	
	updateScreen();
})();