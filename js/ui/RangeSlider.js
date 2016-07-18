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
    var _fontSize = 22*_canvas.height/1824;
    var _radius = 15*_canvas.width/2736;
    var _colorCircle = 'black';
    var _colorBackLine = 'grey';
    var _colorSegmentLine = 'black';
    var _circleX1 = 0;
    var _circleX2 = 0;

    this.draw = function() {
        this.setCircleX1();
        this.setCircleX2();
        this.drawBackLine();
        this.drawSegmentLine();
        this.drawCircles();
    }

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
    }

    this.drawSegmentLine = function() {
        _context.beginPath();
        _context.moveTo(_circleX1, _y);
        _context.lineTo(_circleX2, _y);
        _context.lineWidth = _lineWidth;
        _context.strokeStyle = _colorSegmentLine;
        _context.stroke();
    }

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
        _context.fillText(_value1, _circleX1, _y*0.98);
        _context.fillText(_value2, _circleX2, _y*0.98);
    }

    this.circle1 = function() {
        _context.beginPath();
        _context.arc(_circleX1, _y, _radius, 0, 2*Math.PI, false);
    }

    this.circle2 = function() {
        _context.beginPath();
        _context.arc(_circleX2, _y, _radius, 0, 2*Math.PI, false);
    }

    this.setCircleX1 = function() {
        _circleX1 = _startX+(_endX-_startX)*(_value1/(_maxValue-_minValue));
    }

    this.setCircleX2 = function() {
        _circleX2 = _startX+(_endX-_startX)*(_value2/(_maxValue-_minValue));
    }
}