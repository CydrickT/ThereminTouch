function Rect(x, y, width, height) {
    var _rectX = x;
    var _rectY = y;
    var _rectW = width;
    var _rectH = height;

    this.getX = function() {
        return _rectX;
    };

    this.getY = function() {
        return _rectY;
    };

    this.getHeight = function() {
        return _rectH;
    };

    this.getWidth = function() {
        return _rectW;
    };
}