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
    var _frequencyRange;
    var _mappedStepList;
    
    this.init = function() {
        _inputToStepMapper = new InputToStepMapper();
        _audioController = new AudioController();
        _frequencyRange = new FrequencyRange(54, 111)
        _mappedStepList = _inputToStepMapper.selectFrequencyRange(_frequencyRange);
        this.setAudioController();
        this.createCanvas();
        this.createButtons();
        this.addTouchEvents();
        redrawScene();
    }

    this.setAudioController = function() {
        _audioController.setFrequency(_frequencyRange.getMinimum());
        _audioController.setVolume(1);
        _audioController.setWaveformType(0);
        _audioController.setDetune(0);
        _audioController.setEchoDelay(0);
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
            {x1:0, y1:0, x2:_canvas.separator, y2:_canvas.height*0.95}, //Volume zone
            {x1:_canvas.separator+_canvas.separatorWidth, y1:0, x2:_canvas.width*0.98, y2:_canvas.height*0.884}, //Frequency zone
        ];
        _canvas.zone.push({x1:_canvas.zone[0].x1, y1:_canvas.zone[0].y2, x2:_canvas.zone[0].x2, y2:_canvas.height}); //Volume=0 zone
    }

    this.isInZone = function(x,y) {
        if((x>=_canvas.zone[2].x1 && x<=_canvas.zone[2].x2) && (y>=_canvas.zone[2].y1 && y<=_canvas.zone[2].y2)) {
            return -1; //Volume=0 zone
        } else if((x>=_canvas.zone[0].x1 && x<=_canvas.zone[0].x2) && (y>=_canvas.zone[0].y1 && y<=_canvas.zone[0].y2)) {
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
        _mappedStepList.forEach(function(mappedStep) {
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
        handleButtons(e);
        if (powerIsOn()) {
            play(e);
        } else {
            handleRsPitchStart(e);
            handleOssWaveformStart(e);
        }
    }

    this.handleMove = function(e) {
        e.preventDefault();
        if (powerIsOn()) {
            play(e);
        } else {
            _audioController.pause();
            handleRsPitchMove(e);
        }
    }

    this.handleEnd = function(e) {
        e.preventDefault();
        if (e.touches.length === 0) {
            _inputToStepMapper.resetTouch();
        }
    }

    var play = function(e) {
        var zone1x = getZoneX(e.touches ,1);
        var zone2y = getZoneY(e.touches ,2);
        var zonem1y = getZoneY(e.touches ,-1);
        var current = 0;
        if(zone1x.length === 0) {
            _audioController.setFrequency(_frequencyRange.getMinimum());
        } else {
            zone1x.forEach(function (xZone1) {
                if (xZone1 > current) {
                    current = xZone1;
                }
            });
            var touchPercentage = (current - _canvas.zone[1].x1) / (_canvas.zone[1].x2 - _canvas.zone[1].x1);
            var frequency = _inputToStepMapper.calculateFrequencyFromTouch(touchPercentage);
            redrawScene();
            _context.fillText(touchPercentage, 200, 100);
            _audioController.setFrequency(frequency);
        }

        if (zone2y.length === 0) {
            _audioController.setVolume(1);
        } else {
            zone2y.forEach(function (yZone2) {
                if (yZone2 > current) {
                    current = xZone2;
                }
            });
            var volume = (current - _canvas.zone[0].y1) / (_canvas.zone[0].y2 - _canvas.zone[0].y1);
            redrawScene();
            _context.fillText(volume, 200, 300);
            _audioController.setVolume(volume);
        }
        if (zonem1y.length !== 0) {
            _audioController.setVolume(0);
        }
        _audioController.play();
    }

    var handleButtons = function(e) {
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
                if (powerIsOn()) {
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

    var handleRsPitchStart = function(e) {
        if (_currentPanel !== 0) {
            if (_currentPanel.getType() === 'Pitch') {
                _currentPanel.getRsPitch().handleStart(e);
            }
        }
    }

    var handleRsPitchMove = function(e) {
        if (_currentPanel !== 0) {
            if (_currentPanel.getType() === 'Pitch') {
                _currentPanel.getRsPitch().handleMove(e);
            }
        }
    }

    var handleOssWaveformStart = function(e) {
        if (_currentPanel !== 0) {
            if (_currentPanel.getType() === 'Waveform') {
                _currentPanel.getOssWaveform().handleStart(e);
            }
        }
    }

    var getZoneX = function(touches, zone) {
        var zone1x = [];
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            var x = touch.clientX;
            var y = touch.clientY;
            if (isInZone(x, y) === zone) {
                zone1x.push(x);
            }
        }
        return zone1x;
    }

    var getZoneY = function(touches, zone) {
        var zone1y = [];
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            var x = touch.clientX;
            var y = touch.clientY;
            if (isInZone(x, y) === zone) {
                zone1y.push(y);
            }
        }
        return zone1y;
    }

    this.switchPower = function() {
        _powerIsOn = !_powerIsOn;
    }

    this.powerIsOn = function () {
        return _powerIsOn;
    }

    this.switchBitcrusher = function() {
        _bitcrusherIsOn = !_bitcrusherIsOn;
        _audioController.setEnableBitcrusher(_bitcrusherIsOn);
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
        return _frequencyRange.getMinimum();
    }

    this.setFrequencyMin = function(frequencyMin) {
        _frequencyRange.setMinimum(frequencyMin);
    }

    this.getFrequencyMax = function() {
        return _frequencyRange.getMaximum();
    }

    this.setFrequencyMax = function(frequencyMax) {
        _frequencyRange.setMaximum(frequencyMax);
    }

    window.onload = function() {
        this.init();
    };
}());