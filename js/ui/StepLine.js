function StepLine(xPerc, text, isHalfTone, i){
    var _canvas = getCanvas();
    var _context = getContext();
    var _text = text;
    var _isHalfTone = isHalfTone;
    var _x = _canvas.zone[1].x1+((_canvas.zone[1].x2-_canvas.zone[1].x1)*xPerc);
    var _y1 = _canvas.zone[1].y1;
    var _y2 = _canvas.zone[1].y2;
    var _fontSize = 50*_canvas.height/1824;
    var _yText = (_y1+60*_canvas.height/1824)+i*_y2*0.05;
    
    while (_yText > _y2) {
        i=i-20;
        _yText = (_y1+60*_canvas.height/1824)+i*_y2*0.05;
    }

    this.draw = function() {
        _context.beginPath();
        _context.moveTo(_x,_y1);
        _context.lineTo(_x,_y2);
        _context.lineWidth = 1;
        if (_isHalfTone) {
            _context.strokeStyle = '#00B8F5';
        } else {
            _context.strokeStyle = 'black';
        }
        _context.stroke();
        _context.font = 'italic '+_fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = '#15009E';
        _context.fillText(_text, _x, _yText);
    }
}
