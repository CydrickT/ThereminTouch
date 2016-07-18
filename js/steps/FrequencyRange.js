function FrequencyRange(minimum, maximum){
    var _minimum = minimum;	// Minimum frequency in hertz
    var _maximum = maximum;	// Maximum frequency in hertz

    this.getMinimum = function(){
        return _minimum;
    };

    this.getMaximum = function(){
        return _maximum;
    };

    this.setMinimum = function(minimum) {
        _minimum = minimum;
    }

    this.setMaximum = function(maximum) {
        _maximum = maximum;
    }

    this.getDifference = function(){
        return _maximum - _minimum;
    };
}