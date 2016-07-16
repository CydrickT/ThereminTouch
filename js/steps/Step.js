/**
 * Dependencies:
 * - MusicConstants.js
 * 
 * Represents a step/note in a scale
 * @param stepsAwayFromBaseFrequency The number of steps/notes away from the base frequency (defined as 440 hz)
 * @constructor
 */
function Step(stepsAwayFromBaseFrequency){

    var _stepsAwayFromBaseFrequency = stepsAwayFromBaseFrequency;

    var _note = null;
    var _isHalfTone = null;
    var _octave = null;
    var _frequency = null;

    /**
     * Converts this step as a note (i.e. C#4)
     * Note that the octave will not be displayed if it is below 0.
     * @returns {*} The note as a string.
     */
    this.getNoteAsString = function(){
        var octave = this.getOctave();
        return this.getNote() + (octave < 0 ? "" : octave);
    };


    /**
     * To be used for debugging purposes. Displays the note.
     * @returns {*} The note as a string.
     */
    this.toString = function(){
        return "Note: " + this.getNote() + ", Octave: " + this.getOctave() +", Frequency: "+ this.getFrequency();
    };


    /**
     *  This gets the frequency based on the number of steps away from the reference (440 hz). Positive if you're above 440 hz, negative if you're below 440 hz.
     *
     * This is an implementation of the following formula:
     * fn = f0 * (a)^n
     * @returns {number}
     */
    this.getFrequency = function(){
        if (_frequency === null)
            _frequency = START_FREQUENCY * Math.pow(TWELFTH_ROOT_OF_TWO, _stepsAwayFromBaseFrequency);
        return _frequency;
    };

    /**
     * Gets the number of steps away from the base frequency
     * @returns {*}
     */
    this.getStepsAwayFromBaseFrequency = function(){
        return _stepsAwayFromBaseFrequency;
    };

    /**
     * Gets the note type (ie: C#)
     * @type {number}
     */
    this.getNote = function(){
        if (_note === null)
            this._generateNoteAndOctave();
        return _note;
    };

    /**
     * Gets the Octave of a note (ie: 4)
     * @type {number}
     */
    this.getOctave = function(){
        if (_octave === null)
            this._generateNoteAndOctave();
        return _octave;
    };

    /**
     * Gets if the note is an half-tone (Has a "#")
     * @returns {*} True if it is an half-tone, false if it is a full tone.
     */
    this.isHalfTone = function(){
        if(_isHalfTone === null){
            this._generateNoteAndOctave();
        }
        return _isHalfTone;
    };


    /**
     * Gets the frequency from a percentage around this note, and based on previousStep and nextStep.
     * For instance, if percentage is -0.25, previousStep has a frequency of 15, this step has a frequency of 35,
     * this method will return a frequency of 30 which is 25% below 35, or 35 + ((35-15)*(-0.25))
     * @param percentageAroundNote the percentage
     * @param previousStep the previou step
     * @param nextStep the next step
     * @returns {number}
     */
    this.getFrequencyFromPercentageAroundNote = function(percentageAroundNote, previousStep, nextStep){
        var diff;
        if (percentageAroundNote < 0)
            diff = this.getFrequency() - previousStep.getFrequency();
        else
            diff = nextStep.getFrequency() - this.getFrequency();

        return this.getFrequency() + (diff * percentageAroundNote);
    };


    this._generateNoteAndOctave = function(){
        var noteIndex = START_INDEX;
        var octaveIndex = START_OCTAVE;
        if (stepsAwayFromBaseFrequency > 0){
            for(var index1 = 0; index1 < _stepsAwayFromBaseFrequency; index1++){
                noteIndex++;
                if (noteIndex === NOTES.length) {
                    noteIndex = 0;
                    octaveIndex++;
                }
            }
        }
        else if (stepsAwayFromBaseFrequency < 0){
            for(var index2 = 0; index2 > _stepsAwayFromBaseFrequency; index2--){
                noteIndex--;
                if (noteIndex === -1) {
                    noteIndex = NOTES.length - 1;
                    octaveIndex--;
                }
            }
        }
        _note = NOTES[noteIndex];
        _isHalfTone = IS_HALF_TONE[noteIndex];
        _octave = octaveIndex;

    };
}
