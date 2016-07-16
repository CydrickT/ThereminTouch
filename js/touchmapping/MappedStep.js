/**
 * DEPENDENCIES:
 * - Step.js
 * @param step The Step object associated to this MappedStep
 * @param frequencyRange The FrequencyRange object selected by the user
 * @constructor
 */
function MappedStep(step, frequencyRange){
    var _step = step;
    var _frequencyRange = frequencyRange;
    var _percentage = null;

    this.getPercentage = function() {
        if (_percentage === null) {
            var difference = _frequencyRange.getDifference();
            var frequencySubstr = _step.getFrequency() - _frequencyRange.getMinimum();
            _percentage = frequencySubstr / difference;
        }
        return _percentage;
    };

    this.getStep = function(){
        return step;
    };

    this.toString = function(){
        return "Percentage: " + this.getPercentage() + ", Step: " + _step.toString();
    };

    /**
     * Gets the frequency from the range [-0.5, 0.5] around the closest mapped step where the user pressed
     * @type {getFrequencyFromYValue} returns the frequency in a range between [-0.5, 0.5] from the target frequency
     */
    this.getFrequencyFromPercentageAroundNote = function(yValue, previousMappedStep, nextMappedStep){
        return this.getStep().getFrequencyFromPercentageAroundNote(yValue, previousMappedStep.getStep(), nextMappedStep.getStep());
    };

    /**
     * Gets the percentage in the range [-0.5, 0.5] from where the user pressed compared to the closest mapped step
     * @param userSelectedPercentage
     * @returns {Integer} The value in the range [-0.5, 0.5] from where the user pressed compared to the closest mapped. Note that it returns 0.49999999999999
     * @private
     */
    this.getPercentageAroundNoteFromUserSelectedPercentage = function(userSelectedPercentage, previousMappedStep, nextMappedStep){
        if (userSelectedPercentage < this.getPercentage()){
            var diff = this.getPercentage() - previousMappedStep.getPercentage();
            var pct = ((userSelectedPercentage - previousMappedStep.getPercentage()) / diff) - 1;
            return pct;
        }
        else{
            var diff = nextMappedStep.getPercentage() - this.getPercentage();
            var pct = (userSelectedPercentage - this.getPercentage()) / diff;
            return pct;
        }
    };

}