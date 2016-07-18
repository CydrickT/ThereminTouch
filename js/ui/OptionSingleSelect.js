function OptionSingleSelect(x1, y1, x2, y2, options, color, text) {
    var _canvas = getCanvas();
    var _context = getContext();
    var _x1 = x1;
    var _y1 = y1;
    var _x2 = x2;
    var _y2 = y2;
    var _options = options;
    var _color = color;
    var _text = text;
    var _fontSize = 48 * _canvas.height / 1824;
    var _selectedOption = 0;

    var _xText = (_x1+60*_canvas.height/1824);
    var _yText = 0;
    var _rects = [];

    var _touchX = 0;
    var _touchY = 0;

    this.draw = function() {
        _context.textAlign = 'left';
        _context.fillStyle = 'black';
        var i=0;
        options.forEach(function(option) {
            if (_selectedOption === i) {
                _context.font = 'bold ' + _fontSize*1.1 + 'pt Calibri';
            } else {
                _context.font = _fontSize + 'pt Calibri';
            }
            _yText = (_y1+90*_canvas.height/1824)+i*(_y2-_y1)*0.5;
            if (_yText > _y2) {
                i=i-2;
                _yText = (_y1+90*_canvas.height/1824)+i*(_y2-_y1)*0.5;
                _xText = _xText+(_x2-_x1)*0.5;
            }
            var measuredText = _context.measureText(option);
            _rects.push(new Rect(_xText, _yText, measuredText.width, measuredText.height));
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
        }
    }

    this.checkTouch = function (x,y) {
        var i=0;
        _rects.forEach(function (rect) {
            shape(rect.getX(), rect.getY(), rect.getWidth(), rect.getHeight());
            if (_context.isPointInPath(x, y)){
                return i;
            }
            i++;
        });
        return -1;
    }

    var shape = function (x , y, width, height) {
        _context.beginPath();
        _context.rect(x, y, width, height);
    }
}