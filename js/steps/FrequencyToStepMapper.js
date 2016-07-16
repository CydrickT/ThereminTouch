/**
 * DEPENDENCIES:
 * - MusicConstants.js
 * - Step.js
 * - FrequencyRange.js
 * Frequency to Note mapper. Converts a range of frequency to an array of steps, which you can obtain the note (ie.: C#4).
 *
 * This library uses the A4 step as the baseline.
 * 
 * Here's the formula to get a frequency n half-steps away:
 * 
 * fn = f0 * (a)^n 
 * where
 * f0 = the frequency of one fixed note which must be defined. A common choice is setting the A above middle C (A4) at f0 = 440 Hz.
 * n = the number of half steps away from the fixed note you are. If you are at a higher note, n is positive. If you are on a lower note, n is negative.
 * fn = the frequency of the note n half steps away.
 * a = (2)1/12 = the twelth root of 2 = the number which when multiplied by itself 12 times equals 2 = 1.059463094359... 
 * 
 */
function FrequencyToStepMapper(){

	//The base step which defines
	var _BASE_STEP = new Step(0);

	/**
	 * Get the frequencies within the range where steps are located
 	 * @param frequencyRange A FrequencyRange object
	 * @returns {Array} an array of Step object
     */
	this.getSteps = function(frequencyRange){
		var _arrSteps = [];
		var t = frequencyRange.getMinimum();
		var start = this.getNumberOfStepsAwayFromBaseFrequency(t);
		var end = this.getNumberOfStepsAwayFromBaseFrequency(frequencyRange.getMaximum());
		for (var i = (start + 1); i <= end; i++){
			var step = new Step(i);
			_arrSteps.push(step);
		}
		return _arrSteps;
	};

	/**
	 * This gets the number of steps away from the base step (set at 440 hz). Positive if you're above 440 hz, negative if you're below 440 hz.
	 *
	 * By isolating n in
	 * fn = f0 * (a)^n
	 * we get the following formula:
	 * n = ln(fn/f0)/ln(a)
	 * @param baseFrequency
	 * @returns {number}
     */
	this.getNumberOfStepsAwayFromBaseFrequency = function(baseFrequency){
		return Math.floor(Math.log(baseFrequency/_BASE_STEP.getFrequency())/Math.log(TWELFTH_ROOT_OF_TWO))
	};
	
	this.getPreviousStep = function(currentStep){
		if (currentStep === null)
			return null;
		var previousStepAwayFromFrequency = currentStep.getStepsAwayFromBaseFrequency() - 1;
		var previousStep = new Step(previousStepAwayFromFrequency);
		if (previousStep.getFrequency() < 0)
			return null;
		else
			return previousStep;
	};

	this.getNextStep = function(currentStep){
		if (currentStep === null)
			return null;
		var nextStepAwayFromFrequency = currentStep.getStepsAwayFromBaseFrequency() + 1;
		return new Step(nextStepAwayFromFrequency);
	};
}

