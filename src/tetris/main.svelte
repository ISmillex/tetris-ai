<script>

    import { Tetris } from "./tetris.js";
    import { BOARD_COLUMNS, BOARD_ROWS, convertPositionToIndex, getSpeed} from "./utils.js";
    import {onMount} from "svelte";
    import {fade} from "svelte/transition";


    let cells = [];
    let nextTetrominoCells = [];
    let requestId;
    let timeoutId;
    let score = 0;
    let startText = ["Play", "Press enter or tap to start"];
    let showStart = true;
    let isStarted = false;

    const tetris = new Tetris();

    onMount(async () => {
        const { Hammer } = await import('svelte-hammer');
        initTouch(Hammer);
        document.addEventListener('keydown', onKeydown);
    });


    function setStyle(name) {
        const styles = {
            "I": "background-color: #6be1ec;",
            "J": "background-color: #5eb0f3",
            "L": "background-color: #f2c35b",
            "O": "background-color: #f7e562",
            "S": "background-color: #7be17b",
            "Z": "background-color: #de5c6b",
            "T": "background-color: #b276f3",
            "hide": "animation: hide 0.5s;",
            "ghost": `background: rgba(0, 0, 0, 0.04);`
        };
        return styles[name];
    }


    function onKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (isStarted)
                    rotate();
                break;
            case 'ArrowDown':
                if (isStarted)
                    moveDown();
                break;
            case 'ArrowLeft':
                if (isStarted)
                    moveLeft()
                break;
            case 'ArrowRight':
                if (isStarted)
                    moveRight();
                break;
            case 'Enter': {
                if (isStarted)
                    stopLoop();
                else {
                    showStart = false;
                    moveDown();
                }
                break;
            }
            case ' ':
                if (isStarted)
                    dropDown();
                break;
            default:
                return;
        }
    }

    function initTouch(Hammer) {
        document.addEventListener('dblclick', (event) => event.preventDefault());

        const hammer = new Hammer(document.getElementById('content-tetris'));
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        hammer.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

        const threshold = 30;
        let delta = { x: 0, y: 0 };

        const actions = {
            panstart: () => { if(isStarted) delta = { x: 0, y: 0 } },
            panleft: (event) => { if(isStarted) handlePan(event, 'x', moveLeft) },
            panright: (event) => { if(isStarted) handlePan(event, 'x', moveRight) },
            pandown: (event) => { if(isStarted) handlePan(event, 'y', moveDown) },
            swipedown: () => { if(isStarted) dropDown()}
        };

        for (let action in actions) {
            hammer.on(action, actions[action]);
        }

        function handlePan(event, direction, moveFunc) {
            if (Math.abs(event[`delta${direction.toUpperCase()}`] - delta[direction]) > threshold) {
                moveFunc();
                delta = { x: event.deltaX, y: event.deltaY };
            }
        }

        hammer.on('tap', () => {
            if (isStarted)
                rotate();
            else {
                if (isStarted)
                    stopLoop();
                else {
                    showStart = false;
                    moveDown();
                }
            }
        });
    }


    function moveDown() {
        tetris.moveTetrominoDown();
        draw();
        drawNextTetromino();
        score = tetris.getScore();
        stopLoop();
        startLoop();

        if (tetris.isGameOver) {
            gameOver();
        }
    }

    function moveLeft() {
        tetris.moveTetrominoLeft();
        draw();
    }

    function moveRight() {
        tetris.moveTetrominoRight();
        draw();
    }

    function rotate() {
        tetris.rotateTetromino();
        draw();
    }

    function dropDown() {
        tetris.dropTetrominoDown();
        draw();
        stopLoop();
        startLoop();

        if (tetris.isGameOver) {
            gameOver();
        }
    }

    function startLoop() {
        timeoutId = setTimeout(() => requestId = requestAnimationFrame(moveDown), 1000/getSpeed());
        isStarted = true;
    }

    function stopLoop() {
        cancelAnimationFrame(requestId);
        clearTimeout(timeoutId);
        isStarted = false;
    }

    function draw() {
        cells.forEach(cell => {
            if (cell !== null) {
                cell.style.background = "rgba(0, 0, 0, 0.30)"
                cell.style.border = "none";
            }

        });

        drawPlayfield();
        drawGhostTetromino();
        drawTetromino();
    }

    function drawPlayfield() {
        for (let row = 0; row < BOARD_ROWS; row++) {
            for (let column = 0; column < BOARD_COLUMNS; column++) {
                if (!tetris.playfield[row][column]) continue;
                const name = tetris.playfield[row][column];
                const cellIndex = convertPositionToIndex(row, column);
                cells[cellIndex].style = setStyle(name);
            }
        }
    }

    function drawTetromino() {
        const name = tetris.tetromino.name;
        const tetrominoMatrixSize = tetris.tetromino.matrix.length;
        for (let row = 0; row < tetrominoMatrixSize; row++) {
            for (let column = 0; column < tetrominoMatrixSize; column++) {
                if (!tetris.tetromino.matrix[row][column]) continue;
                if (tetris.tetromino.row + row < 0) continue;
                const cellIndex = convertPositionToIndex(tetris.tetromino.row + row, tetris.tetromino.column + column);
                cells[cellIndex].style = setStyle(name);
            }
        }
    }

    function drawNextTetromino() {
        resetNextTetromino();
        const name = tetris.nextTetromino.name;
        const tetrominoMatrixSize = tetris.nextTetromino.matrix.length;
        for (let row = 0; row < tetrominoMatrixSize; row++) {
            for (let column = 0; column < tetrominoMatrixSize; column++) {
                if (!tetris.nextTetromino.matrix[row][column]) continue;
                const cellIndex = row * 4 + column;
                nextTetrominoCells[cellIndex].style = setStyle(name);
            }
        }
    }

    function drawGhostTetromino() {
        const tetrominoMatrixSize = tetris.tetromino.matrix.length;
        for (let row = 0; row < tetrominoMatrixSize; row++) {
            for (let column = 0; column < tetrominoMatrixSize; column++) {
                if (!tetris.tetromino.matrix[row][column]) continue;
                if (tetris.tetromino.ghostRow + row < 0) continue;
                const cellIndex = convertPositionToIndex(tetris.tetromino.ghostRow + row, tetris.tetromino.ghostColumn + column);
                cells[cellIndex].style = setStyle('ghost', tetris.tetromino.color);
            }
        }
    }

    function resetNextTetromino() {
        nextTetrominoCells.forEach(cell => {
            if (cell !== null) {
                cell.style.background = "rgba(0, 0, 0, 0.30)"
                cell.style.border = "none";
            }
        });
    }

    function resetCells() {
        cells.forEach(cell => {
            if (cell !== null) {
                cell.style.background = "rgba(0, 0, 0, 0.30)"
                cell.style.border = "none";
            }
        });
    }

    function gameOver() {
        stopLoop();
        resetNextTetromino();
        resetCells();
        tetris.reset();
        showStart = true;
        startText = ["Game Over!", "Press enter to play again"];
    }

</script>


<div class="content" id="content-tetris">

    <div class="wrapper">
        {#if showStart}
            <div class="start" transition:fade={{duration: 500}}>
                <h1>{startText[0]}</h1>
                <p>{startText[1]}</p>
            </div>
        {/if}
        <div class="panel" id="panel-right" style="justify-content: space-between; height: 38%">
            <div class="score">{score}</div>
            <div class="next-tetromino">
                {#each Array(12) as _, i (i)}
                    <div class="cell" bind:this={nextTetrominoCells[i]}></div>
                {/each}
            </div>
        </div>
        <div class="grid">
            {#each Array(BOARD_ROWS*BOARD_COLUMNS) as _, i (i)}
                <div class="cell" bind:this={cells[i]}></div>
            {/each}
        </div>
        <div class="panel" id="panel-left" style="align-items: flex-start">
            <div class="title">TETRIS</div>
            <div class="description">Use the arrow keys to move the pieces and the space bar to drop them.</div>
        </div>

    </div>
</div>


<style>

    .content {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        height: 100%;
        width: 100%;
        background: #15142A;
        background: radial-gradient(#37364C, #15142A);
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
    }

    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        height: 82%;
        width: 55%;
    }

    .grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(10, auto);
        grid-template-rows: repeat(20, auto);
        padding: 0.6vh;
        gap: 0.3vh;
        border-radius: 0.6vh;
        background: rgba(0, 0, 0, 0.20);
    }

    .grid>.cell {
        position: relative;
        --cell-size: min(3.5vh, 7.5vw);
        height: var(--cell-size);
        width: var(--cell-size);
        border-radius: 0.3vh;
        background: rgba(0, 0, 0, 0.30);
    }


    .panel {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        height: 100%;
        width: 20%;
    }

    .panel .title {
        font-size: 5vh;
        font-weight: bold;
        color: #FFF3E2;
        margin-bottom: 2vh;
    }

    .panel .description {
        font-size: 2vh;
        color: #FFF3E2;
    }

    .panel .score {
        font-size: 5vh;
        font-weight: bold;
        color: #FFF3E2;
        margin-bottom: 2vh;
    }

    .panel .next-tetromino {
        position: relative;
        display: grid;
        grid-template-columns: repeat(4, auto);
        grid-template-rows: repeat(3, auto);
        padding: 0.6vh;
        gap: 0.3vh;
        border-radius: 0.6vh;
        background: rgba(0, 0, 0, 0.20);
    }

    .panel .next-tetromino>.cell {
        position: relative;
        --cell-size: min(3.5vh, 7.5vw);
        height: var(--cell-size);
        width: var(--cell-size);
        border-radius: 0.3vh;
        background: rgba(0, 0, 0, 0.30);
    }

    .start {
        top: 0;
        left: 0;
        position: absolute;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.60);
        z-index: 1;
    }

    .start h1 {
        color: #FFF3E2;
        font-size: 5rem;
        margin-bottom: 0;
    }

    .start p {
        color: #FFF3E2;
        font-size: 2rem;
        margin-top: 0;
    }


    @keyframes hide {
        0% {
            transform: scale(0.8) rotate(30deg);
        }

        45% {
            transform: scale(0.8) rotate(-30deg);
        }

        90% {
            transform: scale(1) rotate(0);
        }
    }

    @media screen and (max-width: 428px){

        .content {
            align-items: center;
        }

        .wrapper {
            flex-direction: column;
            align-items: center;
            height: 90%;
            justify-content: flex-end;

        }
        .grid>.cell {
            --cell-size: min(3vh, 5.5vw);
        }

        #panel-left{
            display: none;
        }

        #panel-right{
            flex-direction: row;
            width: 100%;
            justify-content: space-between;
        }

        .panel .next-tetromino>.cell {
            --cell-size: min(3vh, 5.5vw);
        }

        .panel .score {
            padding-top: 3vh;
        }

        .start {
            width: 100%;
            height: 100%;
            justify-content: center;
            align-items: center;
        }

        .start h1 {
            font-size: 3rem;
        }

        .start p {
            font-size: 1.5rem;
        }
    }
</style>