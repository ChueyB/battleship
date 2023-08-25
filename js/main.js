/*----- constants -----*/
const LOOKUP = {
    galacticEmpire: {
        name: "Galactic Empire",
        colors: {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        ships: [
            {
                name: 'Bellator Dreadnaught',
                img: 'assets/images/galactic_empire/bellatorDreadnaught.png',
                hp: 3,
            },
            {
                name: 'CR 90',
                img: 'assets/images/galactic_empire/cr90.png',
                hp: 3,
            },
            {
                name: 'Imperial Freighter',
                img: 'assets/images/galactic_empire/imperialFreighter.png',
                hp: 3,
            },
            {
                name: 'Dreadnaught Cruiser',
                img: 'assets/images/galactic_empire/dreadnaughtCruiser.png',
                hp: 6,
            },
            {
                name: 'Tie Fighter',
                img: 'assets/images/galactic_empire/tieFighter.png',
                hp: 1,
            },
        ],
    },
    rebelAlliance: {
        name: "Rebel Alliance",
        colors: {
            hit: 'rgba(32, 80, 131, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        ships: [
            {
                name: 'X Wing',
                img: 'assets/images/rebel_alliance/xWing.png',
                hp: 1,
            },
            {
                name: 'Y Wing',
                img: 'assets/images/rebel_alliance/yWing.png',
                hp: 2,
            },
            {
                name: 'B Wing',
                img: 'assets/images/rebel_alliance/bWing.png',
                hp: 2,
            },
            {
                name: 'H6 Bomber',
                img: 'assets/images/rebel_alliance/h6Bomber.png',
                hp: 2,
            },
            {
                name: 'GR Transport',
                img: 'assets/images/rebel_alliance/grTransport.png',
                hp: 3,
            },
            {
                name: 'Hammerhead Corvette',
                img: 'assets/images/rebel_alliance/hammerheadCorvette.png',
                hp: 4,
            },
            {
                name: 'A Wing',
                img: 'assets/images/rebel_alliance/aWing.png',
                hp: 1,
            },
        ],
    },
    special: {
        deathstar: {
            name: 'Deathstar',
            img: 'assets/images/galactic_empire/deathstar.png',
            hp: 100,
        },
    },
};

const HIT = 'hit';
const MISS = 'miss';
const DIRECTIONS = [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
];

const AUDIO = new Audio(
    'https://github.com/ChueyB/battleship/blob/main/assets/sounds/dueloffates.mp3?raw=true'
);

/*----- state variables -----*/
let game;
let winner;
let loser;
let score;
let alliance;
let enemyAlliance;
let playerBoard;
let computerBoard;
let dragged;
let rotated;
let turn;
let computerTurnLog;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
const endGameModal = document.getElementById('endgame-modal');
const message = document.getElementById('message');
const playerCells = [...document.querySelectorAll('#player-board > div')];
const computerCells = [...document.querySelectorAll('#computer-board > div')];
const shipDockIMGEls = document.querySelector('#all-ships');
const shipDock = document.getElementById('ship-dock');
const scoresEl = document.getElementById('scores');
const instructions = document.getElementById('instructions-container');
const playerBoardEl = document.querySelector('#player-board');
const computerBoardEl = document.querySelector('#computer-board');
const shipName = document.getElementById('ship-name');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again');
const titleSection = document.getElementById('title');
const crawlTitle = document.getElementById('crawl-title');
const loserName = [...document.querySelectorAll('.losing-alliance-name')];
const winnerName = [...document.querySelectorAll('.winning-alliance-name')];
const losingShipCount = [...document.querySelectorAll('.losing-alliance-ships')];
const crawlParagraph = document.getElementById('crawl-paragraph')

/*----- event listeners -----*/
playBtn.addEventListener('click', handlePlay);
restartBtn.addEventListener('click', handleRestartGame);
playAgainBtn.addEventListener('click', handleRestartGame)
document.querySelector('.modal-content').addEventListener('click', handleAllianceChoice);
document.getElementById('rotate-ship').addEventListener('click', handleButtonRotate);
document.getElementById('reset-placement').addEventListener('click', handleResetPlacement);
shipDockIMGEls.addEventListener('dragstart', handleDragStart);
playerBoardEl.addEventListener('dragover', handleDragOver);
playerBoardEl.addEventListener('drop', handleDrop);
playerBoardEl.addEventListener('dragleave', handleDragLeave);
computerBoardEl.addEventListener('click', handleClickingEnemyBoard);

/*----- functions -----*/
init();

function init() {
    alliance = null;
    enemyAlliance = null;
    winner = null;
    loser = null;
    score = [0, 0];
    game = false;
    dragged = null;
    rotated = false;
    computerTurnLog = [[0, 0, 0]];
    playerBoard = [];
    computerBoard = [];
    turn = 'Player';

    render();
}

function render() {
    renderModal();
    renderComputerBoard();
    renderPlayerBoard();
}

function renderComputerBoard() {
    computerBoard = createBoards(10, 10);
}

function renderPlayerBoard() {
    playerBoard = createBoards(10, 10);
    playerBoardEl.style.gridColumn = '2 / 3';
}

function playMusic() {
    AUDIO.volume = 0.05;
    AUDIO.loop = true;
    AUDIO.play();
}

function stopMusic() {
    AUDIO.pause();
    AUDIO.currentTime = 0;
}

function createBoards(rows, cols) {
    return new Array(rows).fill(0).map(() => new Array(cols).fill(0));
}

function handlePlay() {
    if (shipDockIMGEls.childElementCount >= 1) return;

    computerBoardEl.style.display = 'grid';
    shipDock.style.display = 'none';
    instructions.style.display = 'none';
    playerBoardEl.style.gridColumn = '3 / 4';

    game = 1;
    updateScores();
    renderButtons();
    playMusic();
}

function handleRestartGame(g) {
    computerBoardEl.style.display = 'none';
    shipDock.style.display = 'grid';
    instructions.style.display = 'flex';
    playerBoardEl.style.gridColumn = '2 / 4';
    scoresEl.style.display = 'none';
    endGameModal.style.display = 'none';

    game = 0;
    computerTurnLog.length = 0;
    stopMusic();
    init();
}

function renderButtons() {
    if (game === 2) {
        playBtn.style.display = 'none';
        restartBtn.style.display = 'none';
    } else if (game === 1) {
        playBtn.style.display = 'none';
        restartBtn.style.display = 'grid';
    } else {
        playBtn.style.display = 'grid';
        restartBtn.style.display = 'none';
    }
}

function renderScores(totalPlayerShips, totalComputerShips) {
    scoresEl.style.display = 'grid';
    scoresEl.children[0].style.backgroundColor = LOOKUP[enemyAlliance].colors.hit;
    scoresEl.children[1].style.backgroundColor = LOOKUP[alliance].colors.hit;

    if (game !== 0) {
        scoresEl.firstElementChild.innerText = `${score[0] || 0} / ${totalComputerShips}`;
        scoresEl.lastElementChild.innerText = `${score[1] || 0} / ${totalPlayerShips}`;
    }
}

function updateScores() {
    const playerShipsDestroyed = getDestroyedShipCount(alliance)
    const totalPlayerShips = LOOKUP[alliance].ships.length;
    const computerShipsDestroyed = getDestroyedShipCount(enemyAlliance)
    const totalComputerShips = LOOKUP[enemyAlliance].ships.length;

    score[1] = playerShipsDestroyed;
    score[0] = computerShipsDestroyed;

    renderScores(totalPlayerShips, totalComputerShips);
}

function renderModal() {
    modal.style.display = 'flex';
    playerBoardEl.style.display = 'none';
    shipDockIMGEls.innerHTML = '';
    handleResetPlacement();
}

function renderMessage(ally, hitOrMiss) {

    if (!game) {
        message.innerHTML = `Welcome to the <span style="color:${LOOKUP[alliance].colors.hit};">${LOOKUP[alliance].name}</span>`
    } else {
        message.innerHTML = `<span style="color:${LOOKUP[ally].colors.hit};">${turn}</span> ${hitOrMiss}`
    }
}

// Handles alliance choice at the start of game
function handleAllianceChoice(e) {
    if (e.target.tagName !== 'IMG') return;

    alliance = e.target.id;
    enemyAlliance = getEnemyAlliance(alliance);
    modal.style.display = 'none';
    playerBoardEl.style.display = 'grid';
    titleSection.style.display = 'grid';
    game = 0;
    renderShipDock();
    renderButtons();
    setComputerShips();
    renderMessage()
}

// Handle board clicking
function handleClickingEnemyBoard(e) {
    if (e.target.tagName !== 'DIV' || !game || turn === 'Computer') return;
    const [rowIdx, colIdx] = e.target.id.split('-');
    const boardCell = computerBoard[rowIdx - 1][colIdx - 1];

    if (boardCell === HIT || boardCell === MISS) return;

    if (boardCell) {
        e.target.style.backgroundColor = LOOKUP[enemyAlliance].colors.hit;
        handleHits(rowIdx - 1, colIdx - 1, HIT);
    } else {
        e.target.style.backgroundColor = LOOKUP[enemyAlliance].colors.miss;
        handleHits(rowIdx - 1, colIdx - 1, MISS);
    }

    nextTurn();
    checkWinner()
    setTimeout(computerTurn, 500);
}

function computerTurn() {
    if (turn === 'Player') return;

    const [ranRow, ranCol] = getRandomPosition();
    const arrayEl = playerBoard[ranRow][ranCol];

    if (computerTurnLog.some(arr => arr[2] === HIT)) {
        const [lastRow, lastCol, lastHitOrMiss] = getLastHit()
        handleGuessNextCell(lastRow, lastCol);
    } else if (arrayEl === 0) {
        handleHits(ranRow, ranCol, MISS);
        computerTurnLog.pop()
    } else if ((typeof arrayEl === 'string' || arrayEl instanceof String) && arrayEl !== MISS && arrayEl !== HIT) {
        handleHits(ranRow, ranCol, HIT);
    } else {
        return computerTurn();
    }
    if (turn === 'Computer') return nextTurn();
    checkWinner()
}

function handleGuessNextCell(rowIdx, colIdx) {
    const [rowOffset, colOffset] = randomDirec();
    const newRow = rowIdx + rowOffset;
    const newCol = colIdx + colOffset;
    const storeScore = [...score];
    const lastHit = getLastHit()

    if (isValidPosition(newRow, newCol)) {
        if (!playerBoard[newRow][newCol]) {
            handleHits(newRow, newCol, MISS);
        } else if (checkIfSurrounded(lastHit[0], lastHit[1]) && score[1] === score[1]) {
            computerTurnLog.splice(2)
            handleGuessNextCell(lastHit[0], lastHit[1])
        } else if (playerBoard[newRow][newCol] !== HIT && playerBoard[newRow][newCol] !== MISS) {
            handleHits(newRow, newCol, HIT);
            if (score[1] > storeScore[1]) {
                computerTurnLog.splice(1)
            } else {
                clearLastMisses()
            }
        } else if (playerBoard[newRow][newCol] === HIT || playerBoard[newRow][newCol] === MISS) {
            if (checkIfSurrounded(lastHit[0], lastHit[1])) {
                computerTurnLog.splice(2)
                handleGuessNextCell(lastHit[0], lastHit[1])
            }
            handleGuessNextCell(lastHit[0], lastHit[1]);
        }
    } else {
        handleGuessNextCell(rowIdx, colIdx);
    }
    checkWinner()
}

function handleHits(rowIdx, colIdx, hitOrMiss) {
    const nameOfShip = turn === 'Player' ? computerBoard[rowIdx][colIdx] : playerBoard[rowIdx][colIdx];
    const currentEnemyAlliance = turn === 'Player' ? enemyAlliance : alliance;
    const currentCells = turn === 'Player' ? computerCells : playerCells;
    const shipInLookup = LOOKUP[currentEnemyAlliance].ships.find(
        (ship) => ship.name === nameOfShip
    );

    const cellEl = currentCells.find(
        (cell) => cell.id === `${rowIdx + 1}-${colIdx + 1}`
    );

    if (turn === 'Player') {
        computerBoard[rowIdx][colIdx] = hitOrMiss;
        renderMessage(alliance, hitOrMiss);
        cellEl.style.backgroundColor = LOOKUP[enemyAlliance].colors[hitOrMiss];
    } else {
        computerTurnLog.push([rowIdx, colIdx, hitOrMiss]);
        if (computerTurnLog.filter(arr => arr.includes(MISS)).length >= 4) {
            computerTurnLog.splice(1)
        }
        playerBoard[rowIdx][colIdx] = hitOrMiss;
        renderMessage(enemyAlliance, hitOrMiss);
        cellEl.style.backgroundColor = LOOKUP[alliance].colors[hitOrMiss];
    }

    if (!nameOfShip) return;
    shipInLookup.hp -= 1;
    updateScores();
}

// Set Computer Board Ship Locations
function setComputerShips() {
    const enemyShips = LOOKUP[enemyAlliance].ships;
    const rows = computerBoard.length;
    const cols = computerBoard[0].length;

    enemyShips.forEach((ship) => {
        let placementIsValid = false;

        while (!placementIsValid) {
            const startRow = Math.floor(Math.random() * (rows - ship.hp + 1));
            const startCol = Math.floor(Math.random() * (cols - ship.hp + 1));
            const isVertical = Math.random() < 0.5;

            let canPlace = true;

            if (isVertical) {
                for (let i = 0; i < ship.hp; i++) {
                    if (
                        startRow + i >= rows ||
                        computerBoard[startRow + i][startCol] !== 0
                    ) {
                        canPlace = false;
                        break;
                    }
                }
            } else {
                for (let i = 0; i < ship.hp; i++) {
                    if (
                        startCol + i >= cols ||
                        computerBoard[startRow][startCol + i] !== 0
                    ) {
                        canPlace = false;
                        break;
                    }
                }
            }

            if (canPlace) {
                if (isVertical) {
                    for (let i = 0; i < ship.hp; i++) {
                        computerBoard[startRow + i][startCol] = ship.name;
                    }
                } else {
                    for (let i = 0; i < ship.hp; i++) {
                        computerBoard[startRow][startCol + i] = ship.name;
                    }
                }
                placementIsValid = true;
            }
        }
    });
}

// handles all pre-game ship functions

function renderShipDock() {
    if (!alliance) return;

    shipDock.style.display = 'grid';
    let count = playerCells.filter(
        (cell) => cell.childElementCount >= 1
    ).length;

    renderShipName(LOOKUP[alliance].ships[count]);

    if (
        (alliance === 'galacticEmpire' && count > 4) ||
        (alliance === 'rebelAlliance' && count > 6)
    ) {
        return;
    }

    renderShipImage(count)
}

function renderShipImage(shipCount) {
    const newIMG = document.createElement('img');
    newIMG.classList.add('ship-image');
    newIMG.id = `${alliance}-${Math.abs(shipCount)}-${LOOKUP[alliance].ships[shipCount].name
        }`;
    newIMG.src = LOOKUP[alliance].ships[shipCount].img;
    shipDockIMGEls.appendChild(newIMG);
}

function handleButtonRotate() {
    if (shipDockIMGEls.firstElementChild.style.rotate === '0deg') {
        shipDockIMGEls.firstElementChild.style.rotate = '90deg';
        rotated = true;
    } else {
        shipDockIMGEls.firstElementChild.style.rotate = '0deg';
        rotated = false;
    }
}

function handleResetPlacement() {
    playerCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.backgroundColor = 'transparent';
    });
    computerCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.backgroundColor = 'transparent';
    });
    shipDockIMGEls.innerHTML = '';
    rotated = false;

    renderPlayerBoard();
    renderShipDock();
}

// All endgame functions
function checkWinner() {
    const playerShipsDestroyed = getDestroyedShipCount(alliance)
    const computerShipsDestroyed = getDestroyedShipCount(enemyAlliance)
    let loserShipCount;
    if (playerShipsDestroyed === LOOKUP[alliance].ships.length) {
        [winner, loser] = [LOOKUP[enemyAlliance].name, LOOKUP[alliance].name];
        loserShipCount = LOOKUP[alliance].ships.filter((ship) => ship.hp === 0).length;
    } else if (computerShipsDestroyed === LOOKUP[enemyAlliance].ships.length) {
        [winner, loser] = [LOOKUP[alliance].name, LOOKUP[enemyAlliance].name];
        loserShipCount = LOOKUP[enemyAlliance].ships.filter((ship) => ship.hp === 0).length;
    }
    if (winner) {
        endGame([winner, loser, loserShipCount]);
    }
}

function endGame(arr) {
    computerBoardEl.style.display = 'none';
    shipDock.style.display = 'none';
    instructions.style.display = 'none';
    scoresEl.style.display = 'none';
    modal.style.display = 'none';
    playerBoardEl.style.display = 'none';
    shipDockIMGEls.innerHTML = '';
    titleSection.style.display = 'none';

    game = 2;
    renderButtons();
    stopMusic();
    renderEndGameModal(arr);
}

function renderEndGameModal(arr) {
    const [winName, loseName, loserShipCount] = arr;
    let computerAttempts = 0;
    let playerAttempts = 0;
    playerBoard.forEach(row => {
        computerAttempts += row.filter(elVal => elVal !== 0).length
    });
    computerBoard.forEach(row => {
        playerAttempts += row.filter(elVal => elVal !== 0).length
    });
    const winAttempts = winName === LOOKUP[alliance].name ? playerAttempts : computerAttempts;
    crawlTitle.innerText = `${winName} Wins`;
    winnerName.forEach(el => {
        el.innerText = winName;
    })
    loserName.forEach(el => {
        el.innerText = loseName;
    })
    losingShipCount[0].innerText = loserShipCount;
    crawlParagraph.innerText = `While the ${winName} might have been victorious this time, it still took them ${winAttempts} attempts to destroy the ${loseName}'s Fleet.`;
    endGameModal.style.display = 'flex';
}

// Properly place the image into the grid
function imageIntoGrid(e) {
    const { matchingCells } = getShipHoverLength(e);
    const [allianceName, shipID, shipName] = dragged.id.split('-');
    const shipHealth = LOOKUP[allianceName].ships[shipID].hp;

    const [getRow, getCol] = matchingCells[0].id.split('-');
    const cellWidth = matchingCells[0].clientWidth;
    const cellHeight = matchingCells[0].clientHeight;
    const imgWidth = cellWidth * shipHealth;
    const imgHeight = cellHeight;

    dragged.style.position = 'absolute';
    dragged.style.width = `${imgWidth}px`;
    dragged.style.height = `${imgHeight}px`;
    if (rotated) {
        dragged.style.transformOrigin = 'bottom left';
        dragged.style.top = `${getRow - 2}0%`;
    }
}

function getShipHoverLength(e) {
    const divEls = e.target.id.split('-');
    const [allianceName, shipID, shipName] = dragged.id.split('-');
    const hp = LOOKUP[allianceName].ships[shipID].hp;
    const row = parseInt(divEls[0]);
    const col = parseInt(divEls[1]);
    const parentAndIndex = [];

    const matchingCells = playerCells.filter((cell) => {
        const splitArray = cell.id.split('-');
        const rowStart = parseInt(splitArray[0]);
        const colStart = parseInt(splitArray[1]);
        if (!rotated) {
            if (rowStart === row && colStart < col + hp && colStart >= col) {
                parentAndIndex.push({
                    parent: cell.parentElement,
                    index: Array.from(cell.parentElement.children).indexOf(
                        cell
                    ),
                });
                return true;
            }
        } else {
            if (colStart === col && rowStart >= row && rowStart < row + hp) {
                parentAndIndex.push({
                    parent: cell.parentElement,
                    index: Array.from(cell.parentElement.children).indexOf(
                        cell
                    ),
                });
                return true;
            }
        }
    });

    return {
        matchingCells,
        parentAndIndex,
        shipName,
    };
}

function cellColorOnHover(e) {
    const { parentAndIndex } = getShipHoverLength(e);
    const backgroundColor =
        e.type === 'dragleave' || e.type === 'drop'
            ? 'transparent'
            : LOOKUP[alliance].colors.hit;
    parentAndIndex.forEach((cell) => {
        const hoveredCells = playerCells[cell.index];
        hoveredCells.style.backgroundColor = backgroundColor;
    });
    return parentAndIndex.length;
}

function getShipLength(e) {
    const [chosenAlliance, shipIdx] = e.id.split('-');
    return LOOKUP[chosenAlliance].ships[`${shipIdx}`].hp;
}

function handleArrayPlacement(obj) {
    const { matchingCells, shipName } = obj;
    matchingCells.forEach((cell) => {
        const [row, col] = cell.id.split('-');
        playerBoard[row - 1][col - 1] = shipName;
    });
}

// Handles the drag and drop functionality of the Ship Dock
function handleDragStart(e) {
    dragged = e.target;
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.target.tagName !== 'DIV') return;
    cellColorOnHover(e);
}

function handleDragLeave(e) {
    e.preventDefault();
    cellColorOnHover(e);
}

function handleDrop(e) {
    e.preventDefault();
    if (cancelDrop(e)) return;

    if (e.target.tagName === 'DIV') {
        dragged.parentNode.removeChild(dragged);
        e.target.appendChild(dragged);
    }

    if (shipDockIMGEls.childElementCount >= 1) return;
    imageIntoGrid(e);
    handleArrayPlacement(getShipHoverLength(e));
    renderShipDock();
    dragged = null;
    rotated = false;
}

function cancelDrop(e) {
    if (cellColorOnHover(e) < getShipLength(dragged)) {
        return true;
    }
    const { matchingCells } = getShipHoverLength(e);
    return matchingCells.some((cell) => {
        const [row, col] = cell.id.split('-');
        return playerBoard[row - 1][col - 1] === 1;
    });
}

// Small helper functions

function renderShipName(ship) {
    shipName.innerText = ship ? ship.name : '';
}

function clearLastMisses() {
    for (let i = computerTurnLog.length - 1; i >= 0; i--) {
        if (computerTurnLog[i][2] === MISS) {
            computerTurnLog.splice(i, 1);
        }
    }
}

function getLastHit() {
    return computerTurnLog.reduceRight((result, currentArray) => {
        if (!result && currentArray.includes(HIT)) {
            return currentArray;
        }
        return result;
    }, null);
}

function isValidPosition(row, col) {
    return row >= 0 && row < 10 && col >= 0 && col < 10;
}

function randomDirec() {
    const randomIndex = Math.floor(Math.random() * DIRECTIONS.length);
    return DIRECTIONS[randomIndex];
}

function getRandomPosition() {
    return [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
}

function nextTurn() {
    turn = turn === 'Player' ? 'Computer' : 'Player';
}

function getEnemyAlliance(ally) {
    const enemyAlliance = Object.keys(LOOKUP).filter(
        (key) => key !== 'special' && key !== ally
    );

    return enemyAlliance;
}

function getDestroyedShipCount(allianceVar) {
    return LOOKUP[allianceVar].ships.filter((ship) => ship.hp === 0).length;
}

function checkIfSurrounded(rowIdx, colIdx) {
    return DIRECTIONS.every(arr => {
        if (!isValidPosition(rowIdx + arr[0], colIdx + arr[1])) return true;
        const el = playerBoard[rowIdx + arr[0]][colIdx + arr[1]];
        return el === HIT || el === MISS;
    })
}