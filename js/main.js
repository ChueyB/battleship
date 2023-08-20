/*----- imports -----*/

/*----- constants -----*/
const ALLIANCE_LOOKUP = {
    galacticEmpire: {
        colors: {
            primary: '#b83c41',
            secondary: '#3b2e2f',
        },
        ships: [{}],
    },
    rebelAlliance: {
        colors: {
            primary: '#205083',
            secondary: '#f7f3ee',
        },
        ships: [{}],
    },
};

const AUDIO = new Audio('../assets/sounds/dueloffates.mp3');

/*----- state variables -----*/
let game;
// let playerBoard;
// let computerBoard;
let winner;
let score;
let alliance;
let test;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
const playerCells = [...document.querySelectorAll('#player-board > div')];
const computerCells = [...document.querySelectorAll('#computer-board > div')];

/*----- event listeners -----*/
document.getElementById('play-reset').addEventListener('click', playMusic);
document
    .getElementById('modal-content')
    .addEventListener('click', handleChoice);

/*----- classes -----*/

/*----- functions -----*/
init();

function init() {
    alliance = null;
    test = ALLIANCE_LOOKUP.galacticEmpire;

    render();
}

function render() {}

function playMusic() {
    AUDIO.volume = 0.1;
    AUDIO.play();
}

function handleChoice(e) {
    if (e.target.tagName !== 'IMG') return;
    alliance = e.target.id;
    modal.style.display = 'none';
}
