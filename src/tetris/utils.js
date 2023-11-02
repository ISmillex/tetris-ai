// import {browser} from "$app/environment";

export const BOARD_COLUMNS = 10;
export const BOARD_ROWS = 20;

export let speed = 2;


// if (browser) {
//     if (window.matchMedia('(max-width: 600px)').matches) {
//         setBoardColumns(10);
//         setBoardRows(30);
//     }
// }

//
// export function setBoardColumns(newBoardColumns) {
//     BOARD_COLUMNS = newBoardColumns;
// }
//
// export function setBoardRows(newBoardRows) {
//     BOARD_ROWS = newBoardRows;
// }

export function getSpeed() {
    return speed;
}

export function setSpeed(newSpeed) {
    speed = newSpeed;
}

export const TETROMINO_NAMES = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];
export const TETROMINOES = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
    'O': [
        [1, 1],
        [1, 1],
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ]
};

export function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

export function rotateMatrixCenter(matrix) {
    const N = matrix.length;
    const rotatedMatrix = [];
    for (let i = 0; i < N; i++) {
        rotatedMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotatedMatrix[i][j] = matrix[N - j - 1][i];
        }
    }
    return rotatedMatrix;
}

export function rotateMatrixUpperLeft(matrix) {
    const N = matrix.length;
    const rotatedMatrix = [];
    for (let i = 0; i < N; i++) {
        rotatedMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotatedMatrix[i][j] = matrix[j][N - i - 1];
        }
    }
    return rotatedMatrix;
}

export function rotateMatrixUpperRight(matrix) {
    const N = matrix.length;
    const rotatedMatrix = [];
    for (let i = 0; i < N; i++) {
        rotatedMatrix[i] = [];
        for (let j = 0; j < N; j++) {
            rotatedMatrix[i][j] = matrix[N - j - 1][N - i - 1];
        }
    }
    return rotatedMatrix;
}



export function convertPositionToIndex(row, column) {
    return row * BOARD_COLUMNS + column;
}

