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
                hp: 2,
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
                hp: 3,
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
    playerBoard = createBoards(10, 10);
    computerBoard = createBoards(10, 10);

    render();
}

function render() {
    renderPlayerBoard();
    renderComputerBoard();
    renderControls();
}

function renderComputerBoard() {}

function renderPlayerBoard() {
    playerBoard.forEach(function (colArr, rowIdx) {
        colArr.forEach(function (cellVal, colIdx) {
            const cellEl = document.getElementById(
                `${rowIdx + 1}-${colIdx + 1}`
            );
            cellEl.style.backgroundColor = 'pink';
        });
    });
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

function renderShipDock() {
    if (!alliance) return;
    let count = playerCells.filter(
        (cell) => cell.childElementCount >= 1
    ).length;
    renderShipName(LOOKUP[alliance].ships[count]);
    if (count > 4) return;
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
        cell.style.gridColumn = '';
        cell.style.gridRow = '';
        cell.style.backgroundColor = 'transparent';
    });
    shipDockIMGEls.innerHTML = '';
    rotated = false;
    renderShipDock();
}

function imageIntoGrid(e) {
    const { matchingCells } = getShipHoverLength(e);
    // const splitArray = e.target.id.split('-');
    // const rowStart = parseInt(splitArray[0]);
    // const colStart = parseInt(splitArray[1]);
    const [allianceName, shipID] = dragged.id.split('-');
    const shipHealth = LOOKUP[allianceName].ships[shipID].hp;
    const parentAndIndex = [];
    matchingCells.forEach((cell) => {
        parentAndIndex.push({
            parent: cell.parentElement,
            index: Array.from(cell.parentElement.children).indexOf(cell),
        });
    });

    // Calculate the width and height of the image based on the grid cells
    const cellWidth = matchingCells[0].clientWidth;
    const cellHeight = matchingCells[0].clientHeight;
    const imgHeight = cellWidth;
    const imgWidth = cellHeight * shipHealth;

    // Set the image's style
    dragged.style.position = 'absolute';
    dragged.style.width = `${imgWidth}px`;
    dragged.style.height = `${imgHeight}px`;
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
        } else if (rotated) {
            if (colStart === col && rowStart < row + hp && rowStart >= row) {
                parentAndIndex.push({
                    parent: cell.parentElement,
                    index: Array.from(cell.parentElement.children).indexOf(
                        cell
                    ),
                });
                return true;
            }
        } else {
            return false;
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
        e.type === 'dragleave' || e.type === 'drop' ? 'transparent' : 'purple';
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
    if (cellColorOnHover(e) < getShipLength(dragged)) {
        return;
    }

    if (e.target.tagName === 'DIV') {
        dragged.parentNode.removeChild(dragged);
        e.target.appendChild(dragged);
    }

    if (shipDockIMGEls.childElementCount >= 1) return;
    imageIntoGrid(e);
    renderShipDock();
}
