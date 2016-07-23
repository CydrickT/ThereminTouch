function RangeSlider(startX, endX, y, minValue, maxValue, value1, value2) {
    var _canvas = getCanvas();
    var _context = getContext();

    var _startX = startX+50*_canvas.width/2736;
    var _endX = endX-50*_canvas.width/2736;
    var _y = y;
    var _minValue = minValue;
    var _maxValue= maxValue;
    var _value1 = value1;
    var _value2 = value2;

    var _lineWidth = 8*_canvas.width/2736;
    var _fontSize = 32*_canvas.height/1824;
    var _radius = 30*_canvas.width/2736;
    var _colorCircle = 'black';
    var _colorBackLine = 'grey';
    var _colorSegmentLine = 'black';
    var _circleX1 = 0;
    var _circleX2 = 0;

    var _touchX = 0;
    var _touchY = 0;
    var _currentCircle = 0;

    this.handleStart = function(e) {
        _touchX = e.touches[0].clientX;
        _touchY = e.touches[0].clientY;
        if (this.checkTouchCircle1(_touchX, _touchY)) {
            _currentCircle = 1;
            _colorCircle = 'red';
        } else if (this.checkTouchCircle2(_touchX, _touchY)) {
            _currentCircle = 2;
            _colorCircle = 'blue';
        } else {
            _currentCircle = 0;
        }
    };

    this.handleMove = function(e) {
        _touchX = e.touches[0].clientX;
        _touchY = e.touches[0].clientY;
        if (_currentCircle === 1) {
            _value1 = this.update();
            this.setCircleX1();
        } else if (_currentCircle === 2) {
            _value2 = this.update(_value2);
            this.setCircleX2();
        } else {
            return;
        }
        setFrequencyMin(Math.min(_value1, _value2));
        setFrequencyMax(Math.max(_value1, _value2));
        setMappedStepList();
        redrawScene();
    };

    this.handleEnd = function(e) {
        _currentCircle = 0;
    };

    this.update = function() {
        if (_touchX < _startX) {
            return _minValue;
        } else if (_touchX > _endX) {
            return _maxValue;
        } else {
            return Math.floor((_maxValue-_minValue) * (((_touchX - _startX) / (_endX - _startX)))+_minValue);
        }
    };

    this.draw = function() {
        this.setCircleX1();
        this.setCircleX2();
        this.drawBackLine();
        this.drawSegmentLine();
        this.drawCircles();
    };

    this.drawBackLine = function() {
        _context.beginPath();
        _context.moveTo(_startX,_y);
        _context.lineTo(_endX,_y);
        _context.lineWidth = _lineWidth;
        _context.strokeStyle = _colorBackLine;
        _context.stroke();

        _context.font = _fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = 'black';
        _context.fillText(_minValue, _startX, _y*1.03);
        _context.fillText(_maxValue, _endX, _y*1.03);
    };

    this.drawSegmentLine = function() {
        _context.beginPath();
        _context.moveTo(_circleX1, _y);
        _context.lineTo(_circleX2, _y);
        _context.lineWidth = _lineWidth;
        _context.strokeStyle = _colorSegmentLine;
        _context.stroke();
    };

    this.drawCircles = function() {
        this.circle1();
        _context.fillStyle = _colorCircle;
        _context.fill();
        this.circle2();
        _context.fillStyle = _colorCircle;
        _context.fill();

        _context.font = 'bold '+_fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = 'black';
        _context.fillText(_value1, _circleX1, _y*0.965);
        _context.fillText(_value2, _circleX2, _y*0.94);
    };

    this.circle1 = function() {
        _context.beginPath();
        _context.arc(_circleX1, _y, _radius, 0, 2*Math.PI, false);
    };

    this.circle2 = function() {
        _context.beginPath();
        _context.arc(_circleX2, _y, _radius, 0, 2*Math.PI, false);
    };

    this.checkTouchCircle1 = function(x, y) {
        this.circle1();
        return _context.isPointInPath(x, y);
    };

    this.checkTouchCircle2 = function(x, y) {
        this.circle2();
        return _context.isPointInPath(x, y);
    };

    this.setCircleX1 = function() {
        _circleX1 = _startX+(_endX-_startX)*(_value1/(_maxValue-_minValue));
    };

    this.setCircleX2 = function() {
        _circleX2 = _startX+(_endX-_startX)*(_value2/(_maxValue-_minValue));
    };
}