function FrequencyRange(minimum, maximum){
    var _minimum = minimum;	// Minimum frequency in hertz
    var _maximum = maximum;	// Maximum frequency in hertz

    this.getMinimum = function(){
        return _minimum;
    };

    this.getMaximum = function(){
        return _maximum;
    };

    this.getDifference = function(){
        return _maximum - _minimum;
    };
}