function Button(xPerc, yPerc, color, text){
    var _canvas = getCanvas();
    var _context = getContext();
    var _x = _canvas.width*xPerc;
    var _y = _canvas.height*yPerc;
    var _radius = 45*_canvas.width/2736;
    var _color = color;
    var _text = text;
    var _lineWidth = 11*_canvas.width/2736;
    var _fontSize = 28*_canvas.height/1824;
    var _isOn = false;

    this.draw = function() {
        this.shape();
        _context.fillStyle = _color;
        _context.fill();
        _context.lineWidth = _lineWidth;
        _context.strokeStyle = 'black';
        _context.stroke();
        _context.font = 'bold '+_fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = 'black';
        _context.fillText(_text, _x, _y*1.06);
    }

    this.shape = function() {
        _context.beginPath();
        _context.arc(_x, _y, _radius, 0, 2*Math.PI, false);
    }

    this.checkTouch = function(x, y) {
        this.shape();
        return _context.isPointInPath(x, y);
    }

    this.press = function() {
        if (_text === 'Power') {
            switchPower();
            this.switchPowerColor();
        } else {
            setCurrentPanel(new OptionPanel(_x, _y, _text));
        }
        redrawScene();
    }


    this.switchPowerColor = function() {
        if(powerIsOn()) {
            _color = 'green';
        } else {
            _color = 'red';
        }
    }
}