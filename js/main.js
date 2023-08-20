/*----- imports -----*/

/*----- constants -----*/
const LOOKUP = {
    galacticEmpire: {
        colors: {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: '',
        },
        ships: [
            { tieFighter: 'img', hp: 1 },
            { tieBomber: 'img', hp: 1 },
        ],
    },
    rebelAlliance: {
        colors: {
            hit: 'rgba(32, 80, 131, 0.8)',
        },
        ships: [
            { xWing: 'assets/images/rebel_alliance/xWing.png', hp: 1 },
            { yWing: 'img', hp: 1 },
        ],
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
let dragged = null;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
const playerCells = [...document.querySelectorAll('#player-board > div')];
const computerCells = [...document.querySelectorAll('#computer-board > div')];
const shipDockIMG = document.querySelector('#ship-dock > img');
const test = document.querySelector('#player-board');

/*----- event listeners -----*/
document.getElementById('play-reset').addEventListener('click', playMusic);
document
    .getElementById('modal-content')
    .addEventListener('click', handleChoice);
document.getElementById('boards').addEventListener('click', handleCellClick);
document
    .getElementById('rotate-ship')
    .addEventListener('click', handleButtonRotate);
shipDockIMG.addEventListener('dragstart', handleDragStart);
test.addEventListener('dragover', handleDragOver);
test.addEventListener('drop', handleDrop);

/*----- classes -----*/

/*----- functions -----*/
init();

function init() {
    alliance = null;
    score = LOOKUP.galacticEmpire;
    playerBoard = createBoards(10, 10);
    computerBoard = createBoards(10, 10);

    render();
}

function render() {
    renderComputerBoard();
    renderPlayerBoard();
}

function renderComputerBoard() {}

function renderPlayerBoard() {
    let count = 1;
    playerCells.forEach(function (cell, idx) {
        count = (count % 10) + 1;
    });
}

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
    )
        return;
    e.target.style.backgroundColor = 'purple';
}

function handleChoice(e) {
    if (e.target.tagName !== 'IMG') return;
    alliance = e.target.id;
    shipDockIMG.src = LOOKUP.rebelAlliance.ships[0].xWing;
    modal.style.display = 'none';
}

function handleButtonRotate() {
    return shipDockIMG.style.rotate === '0deg'
        ? (shipDockIMG.style.rotate = '90deg')
        : (shipDockIMG.style.rotate = '0deg');
}

function handleDragStart(e) {
    dragged = e.target;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (e.target.tagName === 'DIV') {
        const clonedElement = dragged.cloneNode(true);
        dragged.src = '';
        e.target.appendChild(clonedElement);
    }
}
