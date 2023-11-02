import {
    BOARD_COLUMNS,
    BOARD_ROWS,
    TETROMINO_NAMES,
    TETROMINOES,
    getSpeed,
    setSpeed,
    getRandomElement,
    rotateMatrixCenter,
} from "./utils.js";

export class Tetris {

    constructor() {
        this.playfield;
        this.tetromino;
        this.nextTetromino;
        this.score;
        this.score = 0;
        this.isGameOver;
        this.init();
    }

    init() {
        this.generateBoard();
        this.generateTetromino();
        this.generateNextTetromino();
        this.isGameOver = false;
        this.setScore(0);
        setSpeed(2);
    }

    setScore(score) {
        this.score = score;
    }
    getScore() {
        return this.score;
    }
    generateBoard() {
        this.playfield = new Array(BOARD_ROWS).fill()
            .map(() => new Array(BOARD_COLUMNS).fill(0));
    }

    generateTetromino() {
        const name = getRandomElement(TETROMINO_NAMES);
        const matrix = TETROMINOES[name];

        const column = BOARD_COLUMNS / 2 - Math.floor(matrix.length / 2);
        const row = -2;

        this.tetromino = {
            name,
            matrix,
            row,
            column,
            ghostColumn: column,
            ghostRow: row,
        };

        this.calculateGhostPosition();
    }

    generateNextTetromino() {
        const name = getRandomElement(TETROMINO_NAMES);
        const matrix = TETROMINOES[name];

        const column = BOARD_COLUMNS / 2 - Math.floor(matrix.length / 2);
        const row = -2;

        this.nextTetromino = {
            name,
            matrix,
            row,
            column,
            ghostColumn: column,
            ghostRow: row,
        };

        return this.nextTetromino;
    }

    moveTetrominoDown() {
        this.tetromino.row += 1;
        if (!this.isValid()) {
            this.tetromino.row -= 1;
            this.placeTetromino();
        }
    }

    moveTetrominoLeft() {
        this.tetromino.column -= 1;
        if (!this.isValid()) {
            this.tetromino.column += 1;
        } else {
            this.calculateGhostPosition();
        }
    }

    moveTetrominoRight() {
        this.tetromino.column += 1;
        if (!this.isValid()) {
            this.tetromino.column -= 1;
        } else {
            this.calculateGhostPosition();
        }
    }

    rotateTetromino() {
        const oldMatrix = this.tetromino.matrix;
        const rotatedMatrix = rotateMatrixCenter(this.tetromino.matrix);
        this.tetromino.matrix = rotatedMatrix;
        if (!this.isValid()) {
            this.tetromino.matrix = oldMatrix;
        } else {
            this.calculateGhostPosition();
        }
    }

    dropTetrominoDown() {
        this.tetromino.row = this.tetromino.ghostRow;
        this.placeTetromino();
    }

    isValid() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfGameBoard(row, column)) return false;
                if (this.isCollides(row, column)) return false;
            }
        }
        return true;
    }

    isOutsideOfGameBoard(row, column) {
        return this.tetromino.column + column < 0 ||
            this.tetromino.column + column >= BOARD_COLUMNS ||
            this.tetromino.row + row >= this.playfield.length;
    }

    isCollides(row, column) {
        return this.playfield[this.tetromino.row + row]?.[this.tetromino.column + column];
    }

    placeTetromino() {
        const matrixSize = this.tetromino.matrix.length;
        for (let row = 0; row < matrixSize; row++) {
            for (let column = 0; column < matrixSize; column++) {
                if (!this.tetromino.matrix[row][column]) continue;
                if (this.isOutsideOfTopBoard(row)) {
                    this.isGameOver = true;
                    return;
                }

                this.playfield[this.tetromino.row + row][this.tetromino.column + column] = this.tetromino.name;
            }
        }

        this.processFilledRows();
        this.tetromino = this.nextTetromino;
        this.calculateGhostPosition();
        this.generateNextTetromino();
    }

    isOutsideOfTopBoard(row) {
        return this.tetromino.row + row < 0;
    }

    processFilledRows() {
        const filledLines = this.findFilledRows();
        if(filledLines.length !== 0) {
            this.score += filledLines.length * 10;
            setSpeed(getSpeed() + 0.4);
        }
        this.removeFilledRows(filledLines);
    }

    findFilledRows() {
        const filledRows = [];
        for (let row = 0; row < BOARD_ROWS; row++) {
            if (this.playfield[row].every(cell => Boolean(cell))) {
                filledRows.push(row);
            }
        }

        return filledRows;
    };

    removeFilledRows(filledRows) {
        filledRows.forEach(row => {
            this.dropRowsAbove(row);
        });
    }

    dropRowsAbove(rowToDelete) {
        for (let row = rowToDelete; row > 0; row--) {
            this.playfield[row] = this.playfield[row - 1];
        }
        this.playfield[0] = new Array(BOARD_COLUMNS).fill(0);
    }

    calculateGhostPosition() {
        const tetrominoRow = this.tetromino.row;
        this.tetromino.row++;
        while (this.isValid()) {
            this.tetromino.row++;
        }
        this.tetromino.ghostRow = this.tetromino.row - 1;
        this.tetromino.ghostColumn = this.tetromino.column;
        this.tetromino.row = tetrominoRow;
    }

    reset() {
        this.init();
    }
}