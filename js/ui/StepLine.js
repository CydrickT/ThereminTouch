function StepLine(xPerc, text){
    var _canvas = getCanvas();
    var _context = getContext();
    var _text = text;
    var _x = _canvas.zone[1].x1+((_canvas.zone[1].x2-_canvas.zone[1].x1)*xPerc);
    var _y1 = _canvas.zone[1].y1;
    var _y2 = _canvas.zone[1].y2;
    var _fontSize = 50*_canvas.height/1824;

    this.draw = function() {
        _context.beginPath();
        _context.moveTo(_x,_y1);
        _context.lineTo(_x,_y2);
        _context.lineWidth = 1;
        _context.strokeStyle = 'grey';
        _context.stroke();
        _context.font = 'italic '+_fontSize+'pt Calibri';
        _context.textAlign = 'center';
        _context.fillStyle = 'black';
        _context.fillText(_text, _x, _y1+60*_canvas.height/1824);
    }
}
