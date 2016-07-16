/*
Constants used in the javascript files as base values for counting steps
 */

/**
 * Is equal to 2^(1/12). Pre-calculated to increase speed.
 * @type {number}
 */
var TWELFTH_ROOT_OF_TWO = 1.05946309436;

/**
 * Array of possible notes as string.
 * @type {string[]}
 */
var NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Returns if the note is a half-tone or not (has a "#")
 */
var IS_HALF_TONE = [false, true, false, true, false, false, true, false, true, false, true, false];

/**
 * The start index of the NOTES array. In this case, 9 = A
 * @type {number}
 */
var START_INDEX = 9;

/**
 * The start octave when counting octaves. In this case, 4
 * @type {number}
 */
var START_OCTAVE = 4;

/**
 * The start frequency associated with START_INDEX and START_OCTAVE. In this case, A4 = 440Hz
 * @type {number}
 */
var START_FREQUENCY = 440;