/**
 * DEPENDENCIES:
 * - FrequencyToStepMapper
 * - MappedStep
 * - FrequencyRange
 * 
 * Gets where the Steps should be positioned on a scale of [0, 1]. Also converts a percentage in a range
 * of [0, 1] to a frequency using non-linear frequency mapping around the initial note, and linear frequency mapping
 * before and after 50% around that initial note.
 *
 * General usage:
 *
 * 1)   Call the selectFrequencyRange(FrequencyRange frequencyRange) method and mention the desired frequency range.
 *      The method will return a list of MappedStep objects, containing all the steps inside the selected frequency
 *      range and their position as a percentage, ordered from the smallest step to the biggest
 *
 * 2)   When the user touches the UI or moves his finger, call calculateFrequencyFromTouch(percentage). The percentage
 *      should be in the range [0,1]. The method will return the frequency the user should be playing.
 *
 * 3)   When the user lifts his fingers, call resetTouch()
 * @constructor
 */
function InputToStepMapper(){

    var _frequencyToStepMapper = new FrequencyToStepMapper();
    var _frequencyRange = null;
    var _mappedStepList = [];
    var _insideInitialRange = true;
    var _firstTouch = true;

    var y0;

    /*
        Here is a section of what could be contained in the _mappedStepList:

                              Lower Bound                                 Upper Bound
    <---------|--------------------+---------X-------------|--------------------+---------------|---------->
            Step C#4                    Touch position   Step D4                              Step D#4
            (30%)                                          (40%)                                (55%)
            
      In this case, 
      - Step C#4 is the _previousMappedStepInInitialRange (at 30%)
      - Step D4 is the _targetMappedStepInInitialRange (at 40%)
      - Step D#4 is the _nextMappedStepInInitialRange (at 55%)
      - _lowerBoundOfInitialRange would then be 35%, because it is the midpoint between Step C#4 at 30% and Step D4 at 40%
      - _upperBoundOfInitialRange would then be 47.5%, because it is the midpoint between Step D4 at 40% and Step D#4 at 55%

      Since the touch position is closer from D4 than C#4, D4 is the target, and non-linear frequency mapping will be applied
      around [-0.5, 0.5] its frequency, so between _lowerBound and _upperBound (35% and 47.5%).
      But we need both the previous and the next step in order to compute what will be the frequency with the non-linear
      frequency mapping formula.
     */
    var _previousMappedStepInInitialRange;
    var _targetMappedStepInInitialRange;
    var _nextMappedStepInInitialRange;
    var _lowerBoundOfInitialRange;
    var _upperBoundOfInitialRange;

    /**
     * Gets all the MappedSteps object for a specified FrequencyRange
     * @param frequencyRange The desired FrequencyRange
     * @returns {Array} All the MappedStep object.
     */
    this.selectFrequencyRange = function(frequencyRange){
        if (frequencyRange.getMinimum() <= 1)
            console.log("ERROR: OUTSIDE BOUNDS. MINIMUM FREQUENCY IS 1.");
        this.resetTouch();
        _frequencyRange = frequencyRange;
        var stepList = _frequencyToStepMapper.getSteps(_frequencyRange);
        for(var i = 0; i < stepList.length; i++){
            _mappedStepList.push(new MappedStep(stepList[i], _frequencyRange));
        }
        return _mappedStepList;
    };

    /**
     * To call every time the user removes his finger
     */
    this.resetTouch = function(){
        _insideInitialRange = true;
        _firstTouch = true;
        _previousMappedStepInInitialRange = null;
        _targetMappedStepInInitialRange = null;
        _nextMappedStepInInitialRange = null;
        _lowerBoundOfInitialRange = null;
        _upperBoundOfInitialRange = null;
    };

    /**
     * Based on the research paper "Adaptive mapping for improved pitch accuracy on touch user interfaces" by
     * Olivier Perrotin and Christophe d'Alessandro, section "2.2 Analytic Expression".
     * https://perso.limsi.fr/operrotin/media/Perrotin_NIME13.pdf
     *
     * Please note that the log they're referring in the research paper to is of natural base (e).
     * That confused me for a while...
     *
     * Gets the frequency from a percentage inside the range [0, 1] obtained from the selectFrequencyRange method
     *
     * @type {getFrequency}
     */
    this.calculateFrequencyFromTouch = function(userSelectedPercentage){

        if (userSelectedPercentage > 1 || userSelectedPercentage < 0)
            console.log("ERROR: OUTSIDE BOUNDS. PERCENTAGE SHOULD BE BETWEEN 0 AND 1.");
        
        if(_firstTouch === true){
            // If it's the first touch, we need to define what constitute as the minimum and maximum percentage
            // where we need to apply non-linear frequency mapping.
            // We also need to compute the initial curve
            _firstTouch = false;
            this._setMinAndMaxPercentageForRange(userSelectedPercentage);
            var x0 = _targetMappedStepInInitialRange.getPercentageAroundNoteFromUserSelectedPercentage(
                userSelectedPercentage,
                _previousMappedStepInInitialRange,
                _nextMappedStepInInitialRange);
            //Computing the curvature for the initial touch to play in tune
            y0 = 2*Math.log((1-2*x0)/(1+2*x0));
        }

        if (this._isInsideInitialRange(userSelectedPercentage) === true && y0 !== 0){
            // The user is either still inside the initial range (and never left it) and he did not land on a perfect note.
            // If he landed on a perfect note (y0=0), reverting to linear frequency mapping (he is a pro and does not need our help!)
            var x = _targetMappedStepInInitialRange.getPercentageAroundNoteFromUserSelectedPercentage(
                userSelectedPercentage,
                _previousMappedStepInInitialRange,
                _nextMappedStepInInitialRange);
            // Applying non-linear frequency mapping
            var y = 1/y0 * (Math.log((Math.pow(Math.E, y0) - 1)*(x+0.5)+1))-0.5;
            return _targetMappedStepInInitialRange.getFrequencyFromPercentageAroundNote(y, _previousMappedStepInInitialRange, _nextMappedStepInInitialRange);
        }
        else{
            //Applying linear frequency mapping
            return _frequencyRange.getMinimum() + (userSelectedPercentage * _frequencyRange.getDifference());
        }
    };


    /**
     * Checks if we went outside of the initial range
     * @param percentage
     * @returns {boolean}
     * @private
     */
    this._isInsideInitialRange = function(percentage){
        if (_insideInitialRange === true && (percentage > _upperBoundOfInitialRange || percentage < _lowerBoundOfInitialRange))
            _insideInitialRange = false;
        return _insideInitialRange;
    };

    /**
     * Computes the various values necessary to apply non-linear frequency mapping around [-0.5, 0.5] when it is a first
     * touch.
     * @param percentage
     * @private
     */
    this._setMinAndMaxPercentageForRange = function(percentage){

        var i = -1;
        var rangeFound = false;
        while(rangeFound === false){
            _targetMappedStepInInitialRange = i == -1? this.getPreviousMappedStep(_mappedStepList[0]):_mappedStepList[i];
            _previousMappedStepInInitialRange = this.getPreviousMappedStep(_targetMappedStepInInitialRange);
            _nextMappedStepInInitialRange =  this.getNextMappedStep(_targetMappedStepInInitialRange);

            _lowerBoundOfInitialRange = _previousMappedStepInInitialRange.getPercentage() +
                (_targetMappedStepInInitialRange.getPercentage() - _previousMappedStepInInitialRange.getPercentage())*0.5;

            _upperBoundOfInitialRange = _targetMappedStepInInitialRange.getPercentage() +
                (_nextMappedStepInInitialRange.getPercentage() - _targetMappedStepInInitialRange.getPercentage()) * 0.5;

            //Checking if the user pressed in that range
            if (_lowerBoundOfInitialRange <= percentage && _upperBoundOfInitialRange >= percentage)
                rangeFound = true;
            else
                i++;
        }
    };

    this.getPreviousMappedStep = function(mappedStep){
        return new MappedStep(_frequencyToStepMapper.getPreviousStep(mappedStep.getStep()), _frequencyRange);
    };

    this.getNextMappedStep = function(mappedStep){
        return new MappedStep(_frequencyToStepMapper.getNextStep(mappedStep.getStep()), _frequencyRange);
    };
}
