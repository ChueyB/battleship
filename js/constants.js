/*----- constants -----*/
const ALLIANCE_LOOKUP = {
    galacticEmpire: {
        colors: {
            primary: '#b83c41',
            secondary: '#3b2e2f',
        },
        ships: {},
    },
    rebelAlliance: {
        colors: {
            primary: '#205083',
            secondary: '#f7f3ee',
        },
        ships: {},
    },
};

const AUDIO = new Audio('../assets/sounds/dueloffates.mp3');

export { ALLIANCE_LOOKUP, AUDIO };
