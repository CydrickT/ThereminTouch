function Slider(startX, endX, y, minValue, maxValue, value) {
    var _canvas = getCanvas();
    var _context = getContext();

    var _startX = startX+50*_canvas.width/2736;
    var _endX = endX-50*_canvas.width/2736;
    var _y = y;
    var _minValue = minValue;
    var _maxValue= maxValue;
    var _value = value;

    var _lineWidth = 8*_canvas.width/2736;
    var _fontSize = 32*_canvas.height/1824;
    var _radius = 30*_canvas.width/2736;
    var _colorCircle = 'black';
    var _colorBackLine = 'grey';
    var _circleX = 0;
    var _circleIsSelected = false;

    var _touchX = 0;
    var _touchY = 0;

    this.handleStart = function(e) {
        _touchX = e.touches[0].clientX;
        _touchY = e.touches[0].clientY;
        if (this.checkTouchCircle(_touchX, _touchY)) {
            _circleIsSelected = true;
        }
    };

    this.handleMove = function(e) {
        _touchX = e.touches[0].clientX;
        _touchY = e.touches[0].clientY;
        if (_circleIsSelected) {
            _value = this.update();
            this.setCircleX();
        } else {
            return;
        }
        redrawScene();
    };

    this.handleEnd = function(e) {
        if (getCurrentPanel().getType() === 'Detune') {
            setDetune(_value);
        } else if (getCurrentPanel().getType() === 'Echo') {
            setEcho(_value);
        }
        _circleIsSelected = false;
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
        this.setCircleX();
        this.drawBackLine();
        this.drawCircle();
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

    this.drawCircle = function() {
        this.circle();
        _context.fillStyle = _colorCircle;
        _context.fill();

        _context.font = 'bold '+_fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = 'black';
        _context.fillText(_value, _circleX, _y*0.965);
    };

    this.circle = function() {
        _context.beginPath();
        _context.arc(_circleX, _y, _radius, 0, 2*Math.PI, false);
    };

    this.checkTouchCircle = function(x, y) {
        this.circle();
        return _context.isPointInPath(x, y);
    };

    this.setCircleX = function() {
        //FIXME: Trouver meilleure formule
        _circleX = _startX+(_endX-_startX)*(_value/(_maxValue-_minValue));
        if (Math.abs(_minValue) === _maxValue) {
            _circleX = _circleX+(_endX-_startX)/2;
        }
    };
}