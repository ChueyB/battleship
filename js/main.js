/*----- imports -----*/

/*----- constants -----*/
const LOOKUP = {
    galacticEmpire: {
        colors: {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        ships: [
            {
                name: 'Bellator Dreadnaught',
                img: 'assets/images/galactic_empire/bellatorDreadnaught.png',
                hp: 3,
                isDestroyed: false,
            },
            {
                name: 'CR-90',
                img: 'assets/images/galactic_empire/cr90.png',
                hp: 3,
                isDestroyed: false,
            },
            {
                name: 'Imperial Freighter',
                img: 'assets/images/galactic_empire/imperialFreighter.png',
                hp: 3,
                isDestroyed: false,
            },
            {
                name: 'Dreadnaught Cruiser',
                img: 'assets/images/galactic_empire/dreadnaughtCruiser.png',
                hp: 6,
                isDestroyed: false,
            },
            {
                name: 'Tie Fighter',
                img: 'assets/images/galactic_empire/tieFighter.png',
                hp: 1,
                isDestroyed: false,
            },
        ],
    },
    rebelAlliance: {
        colors: {
            hit: 'rgba(32, 80, 131, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        ships: [
            {
                name: 'X-Wing',
                img: 'assets/images/rebel_alliance/xWing.png',
                hp: 1,
                isDestroyed: false,
            },
            {
                name: 'Y-Wing',
                img: 'assets/images/rebel_alliance/yWing.png',
                hp: 2,
                isDestroyed: false,
            },
            {
                name: 'B-Wing',
                img: 'assets/images/rebel_alliance/bWing.png',
                hp: 2,
                isDestroyed: false,
            },
            {
                name: 'H6-Bomber',
                img: 'assets/images/rebel_alliance/h6Bomber.png',
                hp: 2,
                isDestroyed: false,
            },
            {
                name: 'GR-Transport',
                img: 'assets/images/rebel_alliance/grTransport.png',
                hp: 3,
                isDestroyed: false,
            },
            {
                name: 'Hammerhead Corvette',
                img: 'assets/images/rebel_alliance/hammerheadCorvette.png',
                hp: 4,
                isDestroyed: false,
            },
            {
                name: 'A-Wing',
                img: 'assets/images/rebel_alliance/aWing.png',
                hp: 1,
                isDestroyed: false,
            },
        ],
    },
    special: {
        deathstar: {
            name: 'Deathstar',
            img: 'assets/images/galactic_empire/deathstar.png',
            hp: 100,
            isDestroyed: false,
        },
    },
};

const AUDIO = new Audio(
    'https://github.com/ChueyB/battleship/blob/main/assets/sounds/dueloffates.mp3?raw=true'
);

/*----- state variables -----*/
let game;
let winner;
let score;
let alliance;
let enemyAlliance;
let playerBoard;
let computerBoard;
let dragged;
let rotated;
let turn;
let lastComputerHit;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
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

/*----- event listeners -----*/
playBtn.addEventListener('click', handlePlay);
restartBtn.addEventListener('click', handleRestartGame);
document
    .querySelector('.modal-content')
    .addEventListener('click', handleAllianceChoice);
document
    .getElementById('rotate-ship')
    .addEventListener('click', handleButtonRotate);
document
    .getElementById('reset-placement')
    .addEventListener('click', handleResetPlacement);
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
    score = [];
    game = false;
    dragged = null;
    rotated = false;
    lastComputerHit = [];
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

    renderScores(alliance);
    game = 1;
    renderButtons();
    playMusic();
}

function handleRestartGame() {
    stopMusic();
}

function renderButtons() {
    if (game) {
        playBtn.style.display = 'none';
        restartBtn.style.display = 'grid';
    } else {
        playBtn.style.display = 'grid';
        restartBtn.style.display = 'none';
    }
}

function renderScores(ally) {
    scoresEl.style.display = 'grid';
    scoresEl.children[0].style.backgroundColor =
        LOOKUP[enemyAlliance].colors.hit;
    scoresEl.children[1].style.backgroundColor = LOOKUP[ally].colors.hit;
    if (!game) return;
    scoresEl.firstElementChild.innerText = score[0];
    scoresEl.lastElementChild.innerText = score[1];
}

function getEnemyAlliance(ally) {
    const enemyAlliance = Object.keys(LOOKUP).filter(
        (key) => key !== 'special' && key !== ally
    );
    return enemyAlliance;
}

// Handles the modal choice prior to starting the game
function renderModal() {
    modal.style.display = 'flex';
    playerBoardEl.style.display = 'none';
    handleResetPlacement();
}

function handleAllianceChoice(e) {
    if (e.target.tagName !== 'IMG') return;
    alliance = e.target.id;
    enemyAlliance = getEnemyAlliance(alliance);
    modal.style.display = 'none';
    playerBoardEl.style.display = 'grid';
    renderShipDock();
    renderInstructions();
    renderButtons();
    setComputerShips();
}
// Handle Turns
function nextTurn() {
    turn = turn === 'Player' ? 'Computer' : 'Player';
}

// Handle board clicking
function handleClickingEnemyBoard(e) {
    if (e.target.tagName !== 'DIV' || !game || turn === 'Computer') return;
    const [rowIdx, colIdx] = e.target.id.split('-');
    const boardCell = computerBoard[rowIdx - 1][colIdx - 1];
    if (boardCell === 1) return;
    if (boardCell) {
        e.target.style.backgroundColor = LOOKUP[enemyAlliance].colors.hit;
        handleHits(rowIdx, colIdx);
        updateScores(alliance);
    } else {
        e.target.style.backgroundColor = LOOKUP[enemyAlliance].colors.miss;
        handleHits(rowIdx, colIdx);
    }
    nextTurn();
}

function computerTurn() {
    if (turn === 'Player') return;
    const [ranRow, ranCol] = [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
    ];
    if (lastComputerHit) {
        if (playerBoard[ranRow][ranCol]) {
        }
    } else if (playerBoard[ranRow][ranCol]) {
    }
}

function handleHits(rowIdx, colIdx) {
    const nameOfShip =
        turn === 'Player'
            ? computerBoard[rowIdx - 1][colIdx - 1]
            : playerBoard[rowIdx - 1][colIdx - 1];
    const currentAllianceTurn = turn === 'Player' ? alliance : enemyAlliance;
    const shipInLookup = LOOKUP[currentAllianceTurn].ships.find(
        (ship) => ship.name === nameOfShip
    );
    if (turn === 'Player') {
        computerBoard[rowIdx - 1][colIdx - 1] = 1;
    } else {
        lastComputerHit = [rowIdx, colIdx];
        playerBoard[rowIdx - 1][colIdx - 1] = 1;
    }
    if (!nameOfShip) return;
    shipInLookup.hp -= 1;
}

function updateScores() {
    score[0] = LOOKUP[alliance].ships.filter((ship) => ship.hp === 0).length;
    score[1] = LOOKUP[enemyAlliance].ships.filter(
        (ship) => ship.hp === 0
    ).length;
    renderScores(alliance);
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
    const newIMG = document.createElement('img');
    newIMG.classList.add('ship-image');
    newIMG.id = `${alliance}-${Math.abs(count)}`;
    newIMG.src = LOOKUP[alliance].ships[count].img;
    shipDockIMGEls.appendChild(newIMG);
}

function renderInstructions() {
    instructions.style.display = 'flex';
}

function renderShipName(ship) {
    shipName.innerText = ship ? ship.name : '';
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
    shipDockIMGEls.innerHTML = '';
    rotated = false;
    renderPlayerBoard();
    renderShipDock();
}

// Properly place the image into the grid
function imageIntoGrid(e) {
    const { matchingCells } = getShipHoverLength(e);
    const [allianceName, shipID] = dragged.id.split('-');
    const shipHealth = LOOKUP[allianceName].ships[shipID].hp;
    const parentAndIndex = [];
    matchingCells.forEach((cell) => {
        parentAndIndex.push({
            parent: cell.parentElement,
            index: Array.from(cell.parentElement.children).indexOf(cell),
        });
    });

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
    const [allianceName, shipID] = dragged.id.split('-');
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
    const { matchingCells } = obj;
    matchingCells.forEach((cell) => {
        const [row, col] = cell.id.split('-');
        playerBoard[row - 1][col - 1] = 1;
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
