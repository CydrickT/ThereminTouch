(function() {

    var _buttons = [];
    var _stepLines = [];
    var _currentPanel = 0;
    var _powerIsOn = false;
    var _canvas;
    var _context;
    
    var inputToStepMapper;

    this.switchPower = function() {
        _powerIsOn = !_powerIsOn;
    }

    this.powerIsOn = function () {
        return _powerIsOn;
    }
    
    this.getCanvas = function () {
        return _canvas;
    }

    this.getContext = function () {
        return _context;
    }

    this.getCurrentPanel = function () {
        return _currentPanel;
    }

    this.setCurrentPanel = function (panel) {
        _currentPanel = panel;
    }

    this.createCanvas = function() {
        _canvas = document.getElementById('myCanvas');
        _context = _canvas.getContext('2d');
        _canvas.height = window.innerHeight-4;
        _canvas.width = window.innerWidth-4;
        _canvas.separator = Math.floor(window.innerWidth*0.3);
        _canvas.separatorWidth = 30;
        _canvas.zone = [
            {x1:0, y1:0, x2:_canvas.separator, y2:_canvas.height*0.95},
            {x1:_canvas.separator+_canvas.separatorWidth, y1:0, x2:_canvas.width*0.98, y2:_canvas.height*0.884}
        ];

        _stepLines.push(new StepLine(0.5, 'C#2'));
    }

    this.isInZone = function(x,y) {
        if((x>=_canvas.zone[0].x1 && x<=_canvas.zone[0].x2) && (y>=_canvas.zone[0].y1 && y<=_canvas.zone[0].y2)) {
            return 0; //Volume zone
        } else if ((x>=_canvas.zone[1].x1 && x<=_canvas.zone[1].x2) && (y>=_canvas.zone[1].y1 && y<=_canvas.zone[1].y2)) {
            return 1; //Frequency zone
        } else {
            return 2; //Non playing zone
        }
    }

    this.createButtons = function() {
        var pitchButton = new Button(0.40, 0.938, 'gray', 'Pitch');
        var waveformButton = new Button(0.50, 0.938, 'gray', 'Waveform');
        var detuneButton = new Button(0.60, 0.938, 'gray', 'Detune');
        var echoButton = new Button(0.70, 0.938, 'gray', 'Echo');
        var brightnessButton = new Button(0.80, 0.938, 'gray', 'Brightness');
        var powerButton = new Button(0.97, 0.938, 'red', 'Power');

        _buttons.push(powerButton);
        _buttons.push(pitchButton);
        _buttons.push(waveformButton);
        _buttons.push(detuneButton);
        _buttons.push(echoButton);
        _buttons.push(brightnessButton);
    }

    this.drawButtons = function() {
        if(_powerIsOn) {
            _buttons[0].draw();
        } else {
            _buttons.forEach(function (button) {
                button.draw();
            });
        }
    }
    
    this.drawStepLines = function() {
        _stepLines.forEach(function(stepLine) {
            stepLine.draw();
        });
    }
    
    this.drawSeparator = function() {
        _context.fillStyle = 'black';
        _context.fillRect(_canvas.separator,0,_canvas.separatorWidth,_canvas.height);
    }

    this.drawCurrentPanel = function() {
        if (_currentPanel !== 0) {
            //if (!_currentPanel.isOpen()) {
                _currentPanel.draw();
           //}
        }
    }

    this.redrawScene = function() {
        _context.clearRect(0, 0, _canvas.width, _canvas.height);
        this.drawSeparator();
        this.drawButtons();
        this.drawStepLines();
        this.drawCurrentPanel();
    }

    this.addTouchEvents = function() {
        _canvas.addEventListener("touchstart", handleStart, false);
        _canvas.addEventListener("touchend", handleEnd, false);
        _canvas.addEventListener("touchmove", handleMove, false);
    }

    this.handleMove = function(e) {
        e.preventDefault();

        for (var i=0; i<e.touches.length; i++) {
            var touch = e.touches[i];
            var x = touch.clientX;
            var y = touch.clientY;
        }
    }

    this.handleStart = function(e) {
        e.preventDefault();

        for (var i=0; i<e.touches.length; i++) {
            var touch = e.touches[i];
            var x = touch.clientX;
            var y = touch.clientY;
            if (_currentPanel !== 0) {
                if (_currentPanel.checkNotTouch(x,y)) {
                    setCurrentPanel(0);
                    redrawScene();
                }
            }
            if(e.touches.length<=1) {
                if (_powerIsOn) {
                    if (_buttons[0].checkTouch(x, y)) {
                        _buttons[0].press();
                    }
                } else {
                    _buttons.forEach(function (button) {
                        if (button.checkTouch(x, y)) {
                            button.press();
                        }
                    });
                }
            }
        }
    }

    this.handleEnd = function(e) {
        e.preventDefault();

        //Dernier touch: inputToStepMapper.resetTouch();
    }

    this.init = function() {
        inputToStepMapper = new InputToStepMapper();
        this.createCanvas();
        this.createButtons();
        this.addTouchEvents();
        this.redrawScene();
    }

    window.onload = function() {
        this.init();
    };
}());