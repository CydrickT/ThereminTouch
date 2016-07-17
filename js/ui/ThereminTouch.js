(function() {

    var _buttons = [];
    var _stepLines = [];
    var _currentPanel = 0;
    var _powerIsOn = false;
    var _bitcrusherIsOn = false;
    var _continuousIsOn = false;
    var _canvas;
    var _context;
    
    var _inputToStepMapper;
    var _audioController;
    var _frequencyMin = 30;
    var _frequencyMax = 500;
    
    this.init = function() {
        _inputToStepMapper = new InputToStepMapper();
        _audioController = new AudioController();
        this.setAudioController();
        this.createCanvas();
        this.createButtons();
        this.addTouchEvents();
        redrawScene();
    }

    this.setAudioController = function() {

        _audioController.setFrequency(100);
        _audioController.setVolume(1);
        _audioController.setWaveformType(0);
        //_audioController.setDetune(100);
        //_audioController.setEchoDelay(0);
        _audioController.setEnableBitcrusher(false);
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
        var pitchButton = new Button(0.37, 0.938, 'panel', 'Pitch');
        var waveformButton = new Button(0.45, 0.938, 'panel', 'Waveform');
        var detuneButton = new Button(0.53, 0.938, 'panel', 'Detune');
        var echoButton = new Button(0.61, 0.938, 'panel', 'Echo');
        var bitcrusherButton = new Button(0.69, 0.938, 'switch', 'Bitcrusher');
        var continuousButton = new Button(0.77, 0.938, 'switch', 'Continuous');
        var powerButton = new Button(0.97, 0.938, 'switch', 'Power');

        _buttons.push(powerButton);
        _buttons.push(pitchButton);
        _buttons.push(waveformButton);
        _buttons.push(detuneButton);
        _buttons.push(echoButton);
        _buttons.push(bitcrusherButton);
        _buttons.push(continuousButton);
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
        _stepLines = [];
        var i=0;
        _inputToStepMapper.selectFrequencyRange(new FrequencyRange(_frequencyMin, _frequencyMax)).forEach(function(mappedStep) {
            _stepLines.push(new StepLine(mappedStep.getPercentage(), mappedStep.getStep().getNoteAsString(), mappedStep.getStep().isHalfTone(), i));
            i++;
        });
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

    this.handleStart = function(e) {
        e.preventDefault();
        if (_currentPanel !== 0) {
            if (_currentPanel.getType() === 'Pitch') {
                _currentPanel.getRsPitch().handleStart(e);
            }
        }

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

    this.handleMove = function(e) {
        e.preventDefault();
        if (_currentPanel !== 0) {
            if (_currentPanel.getType() === 'Pitch') {
                _currentPanel.getRsPitch().handleMove(e);
            }
        }
        var zone1x = [];
        var currentX = 0;
        for (var i = 0; i < e.touches.length; i++) {
            var touch = e.touches[i];
            var x = touch.clientX;
            var y = touch.clientY;
            if (isInZone(x, y) === 1) {
                zone1x.push(x);
            }
        }

        zone1x.forEach(function (xZone1) {
            if (xZone1 > currentX) {
                currentX = xZone1;
            }
        });
        _audioController.setFrequency(_inputToStepMapper.calculateFrequencyFromTouch((_canvas.zone[1].x2 - _canvas.zone[1].x1) / (currentX - _canvas.zone[1].x1)));
        _audioController.play();
    }

    this.handleEnd = function(e) {
        e.preventDefault();
        if (e.touches.length === 0) {
            _inputToStepMapper.resetTouch();
        }
    }

    this.switchPower = function() {
        _powerIsOn = !_powerIsOn;
    }

    this.powerIsOn = function () {
        return _powerIsOn;
    }

    this.switchBitcrusher = function() {
        _bitcrusherIsOn = !_bitcrusherIsOn;
    }

    this.bitcrusherIsOn = function () {
        return _bitcrusherIsOn;
    }

    this.switchContinuous = function() {
        _continuousIsOn = !_continuousIsOn;
    }

    this.continuousIsOn = function () {
        return _continuousIsOn;
    }

    this.getFrequencyMin = function() {
        return _frequencyMin;
    }

    this.setFrequencyMin = function(frequencyMin) {
        _frequencyMin = frequencyMin;
    }

    this.getFrequencyMax = function() {
        return _frequencyMax;
    }

    this.setFrequencyMax = function(frequencyMax) {
        _frequencyMax = frequencyMax;
    }

    window.onload = function() {
        this.init();
    };
}());