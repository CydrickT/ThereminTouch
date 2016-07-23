function OptionSingleSelect(x1, y1, x2, y2, options, color) {
    var _canvas = getCanvas();
    var _context = getContext();
    var _x1 = x1;
    var _y1 = y1;
    var _x2 = x2;
    var _y2 = y2;
    var _options = options;
    var _color = color;
    var _fontSize = 44 * _canvas.height / 1824;
    var _selectedOption = 0;

    var _xText = (_x1+60*_canvas.height/1824);
    var _yText = 0;
    var _rects = [];

    var _touchX = 0;
    var _touchY = 0;

    this.draw = function() {
        _context.textAlign = 'center';
        _context.fillStyle = _color;
        _rects = [];
        var i=0;
        _options.forEach(function(option) {
            if (_selectedOption === i) {
                _context.font = 'bold ' + _fontSize*1.1 + 'pt Calibri';
            } else {
                _context.font = _fontSize + 'pt Calibri';
            }
            _yText = _y1+225*_canvas.height/1824;
            _xText = _x1*1.35+i*((_x2-_x1)/_options.length);
            var width = _context.measureText(option).width*1.15;
            _rects.push(new Rect(_xText-(width/2), _yText*0.96, width, _fontSize*1.7));
            _context.fillText(option, _xText, _yText);
            i++;
        });
    }
    
    this.handleStart = function(e) {
        _touchX = e.touches[0].clientX;
        _touchY = e.touches[0].clientY;
        var i = this.checkTouch(_touchX, _touchY);
        if (i !== -1) {
            _selectedOption = i;
            setWaveform(i);
            redrawScene();
        }
    }

    this.checkTouch = function (x,y) {
        for(var i = 0; i < _rects.length; i++){
            shape(_rects[i].getX(), _rects[i].getY(), _rects[i].getWidth(), _rects[i].getHeight());
            if (_context.isPointInPath(x, y)){
                return i;
            }
        }
        return -1;
    }

    var shape = function (x , y, width, height) {
        _context.beginPath();
        _context.rect(x, y, width, height);
    }
}