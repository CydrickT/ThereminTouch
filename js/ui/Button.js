function Button(xPerc, yPerc, type, text){
    var _canvas = getCanvas();
    var _context = getContext();
    var _x = _canvas.width*xPerc;
    var _y = _canvas.height*yPerc;
    var _radius = 45*_canvas.width/2736;
    var _color = 0;
    var _type = type;
    var _text = text;
    var _lineWidth = 11*_canvas.width/2736;
    var _fontSize = 28*_canvas.height/1824;
    var _isOn = false;

    // FIXME: Essayer de trouver une meilleure logique
    if (_type === 'panel') {
        _color = 'gray';
    } else if (_type === 'switch') {
        if (_text === 'Power') {
            if(powerIsOn()) {
                _color = 'green';
            } else {
                _color = 'red';
            }
        }
        if (_text === 'Continuous') {
            if(continuousIsOn()) {
                _color = 'green';
            } else {
                _color = 'red';
            }
        }
        if (_text === 'Bitcrusher') {
            if(bitcrusherIsOn()) {
                _color = 'green';
            } else {
                _color = 'red';
            }
        }
    }

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
    };

    this.shape = function() {
        _context.beginPath();
        _context.arc(_x, _y, _radius, 0, 2*Math.PI, false);
    };

    this.checkTouch = function(x, y) {
        this.shape();
        return _context.isPointInPath(x, y);
    };

    this.press = function() {
        if (_type === 'panel') {
            setCurrentPanel(new OptionPanel(_x, _y, _text));
        } else {
            switch (_text) {
                case "Bitcrusher":
                    switchBitcrusher();
                    break;
                case "Continuous":
                    switchContinuous();
                    break;
                case "Power":
                    switchPower();
                    break;
            }
            this.switchColor();
        }
        redrawScene();
    };

    this.switchColor = function() {
        if(_color === 'red') {
            _color = 'green';
        } else {
            _color = 'red';
        }
    };

    this.getText = function() {
        return _text;
    };
}