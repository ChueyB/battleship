/*----- imports -----*/

/*----- constants -----*/
const LOOKUP = {
    galacticEmpire: {
        colors: {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: '',
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

const AUDIO = new Audio('../assets/sounds/dueloffates.mp3');

/*----- state variables -----*/
let game;
let winner;
let score;
let alliance;
let playerBoard;
let computerBoard;
let dragged;
let rotated;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
const playerCells = [...document.querySelectorAll('#player-board > div')];
const computerCells = [...document.querySelectorAll('#computer-board > div')];
const shipDockIMGEls = document.querySelector('#all-ships');
const playerBoardEl = document.querySelector('#player-board');
const shipName = document.getElementById('ship-name');

/*----- event listeners -----*/
document.getElementById('play-reset').addEventListener('click', playMusic);
document
    .getElementById('modal-content')
    .addEventListener('click', handleAllianceChoice);
document.getElementById('boards').addEventListener('click', handleCellClick);
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

/*----- classes -----*/

/*----- functions -----*/
init();

function init() {
    alliance = null;
    winner = null;
    score = [];
    game = false;
    dragged = null;
    rotated = false;
    playerBoard = [];
    computerBoard = createBoards(10, 10);

    render();
}

function render() {
    renderComputerBoard();
    renderPlayerBoard();
    renderControls();
}

function renderComputerBoard() {}

function renderPlayerBoard() {
    playerBoard = createBoards(10, 10);
}

function renderControls() {}

function playMusic() {
    AUDIO.volume = 0.05;
    AUDIO.play();
}

function createBoards(rows, cols) {
    return new Array(rows).fill(null).map(() => new Array(cols).fill(null));
}

function handleCellClick(e) {
    if (
        e.target.tagName !== 'DIV' ||
        e.target.parentElement.id === 'player-board'
    ) {
        return;
    }
}

// Handles the modal choice prior to starting the game
function handleAllianceChoice(e) {
    if (e.target.tagName !== 'IMG') return;
    alliance = e.target.id;
    modal.style.display = 'none';
    playerBoardEl.style.display = 'grid';
    renderShipDock();
}

// Everything below handles all pre-game ship functions

function renderShipDock() {
    if (!alliance) return;
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

    // Set the image's style
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
