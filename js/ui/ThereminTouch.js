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
    var _detune = 0;
    var _echo = 0;
    
    this.init = function() {
        _inputToStepMapper = new InputToStepMapper();
        _audioController = new AudioController();
        _frequencyRange = new FrequencyRange(300, 1000);
        _mappedStepList = _inputToStepMapper.selectFrequencyRange(_frequencyRange);
        this.setAudioController();
        this.createCanvas();
        this.createButtons();
        this.addTouchEvents();
        redrawScene();
    };

    this.setAudioController = function() {
        _audioController.setFrequency(_frequencyRange.getMinimum());
        _audioController.setVolume(1);
        _audioController.setWaveformType(0);
        _audioController.setDetune(_detune);
        _audioController.setEchoDelay(_echo);
        _audioController.setEnableBitcrusher(false);
    };
    
    this.getCanvas = function () {
        return _canvas;
    };

    this.getContext = function () {
        return _context;
    };

    this.getCurrentPanel = function () {
        return _currentPanel;
    };

    this.setCurrentPanel = function (panel) {
        _currentPanel = panel;
    };

    this.createCanvas = function() {
        _canvas = document.getElementById('myCanvas');
        _context = _canvas.getContext('2d');
        _canvas.height = window.innerHeight-4;
        _canvas.width = window.innerWidth-4;
        _canvas.separator = window.innerWidth*0.297;
        _canvas.separatorWidth = 30;
        _canvas.zone = [
            {x1:0, y1:0, x2:_canvas.separator, y2:_canvas.height*0.9}, //Volume zone
            {x1:_canvas.separator+_canvas.separatorWidth, y1:0, x2:_canvas.width*0.98, y2:_canvas.height*0.884}, //Frequency zone
        ];
        _canvas.zone.push({x1:_canvas.zone[0].x1, y1:_canvas.zone[0].y2, x2:_canvas.zone[0].x2, y2:_canvas.height}); //Volume=0 zone
    };

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
    };

    this.createButtons = function() {
        _buttons = [];
        var pitchButton = new Button(0.37, 0.938, 'panel', 'Pitch');
        var waveformButton = new Button(0.45, 0.938, 'panel', 'Waveform');
        var detuneButton = new Button(0.53, 0.938, 'panel', 'Detune');
        var echoButton = new Button(0.61, 0.938, 'panel', 'Echo');
        var bitcrusherButton = new Button(0.69, 0.938, 'switch', 'Bitcrusher');
        //var continuousButton = new Button(0.77, 0.938, 'switch', 'Continuous');
        var powerButton = new Button(0.97, 0.938, 'switch', 'Power');

        _buttons.push(powerButton);
        _buttons.push(pitchButton);
        _buttons.push(waveformButton);
        _buttons.push(detuneButton);
        _buttons.push(echoButton);
        _buttons.push(bitcrusherButton);
        //_buttons.push(continuousButton);
    };

    this.drawButtons = function() {
        if(_powerIsOn) {
            _buttons[0].draw();
        } else {
            _buttons.forEach(function (button) {
                button.draw();
            });
        }
    };
    
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
    };
    
    this.drawSeparator = function() {
        _context.globalAlpha=0.2;
        _context.fillStyle = 'black';
        _context.fillRect(_canvas.separator,0,_canvas.separatorWidth,_canvas.height);
        _context.globalAlpha=1;
    };

    this.drawCurrentPanel = function() {
        if (_currentPanel !== 0) {
            //if (!_currentPanel.isOpen()) {
                _currentPanel.draw();
           //}
        }
    };

    this.redrawScene = function() {
        _context.clearRect(0, 0, _canvas.width, _canvas.height);
        this.drawSeparator();
        this.drawButtons();
        this.drawStepLines();
        this.drawCurrentPanel();
    };

    this.addTouchEvents = function() {
        _canvas.addEventListener("touchstart", handleStart, false);
        _canvas.addEventListener("touchend", handleEnd, false);
        _canvas.addEventListener("touchmove", handleMove, false);
    };

    this.handleStart = function(e) {
        e.preventDefault();
        handleButtons(e);
        if (powerIsOn()) {
            play(e);
        } else {
            _audioController.pause();
            handleOptionStart(e);
        }
    }

    this.handleMove = function(e) {
        e.preventDefault();
        if (powerIsOn()) {
            play(e);
        } else {
            _audioController.pause();
            handleOptionMove(e);
        }
    };

    this.handleEnd = function(e) {
        e.preventDefault();
        if (powerIsOn()) {
            play(e);
        } else {
            _audioController.pause();
            handleOptionEnd();
        }
        if (e.touches.length === 0) {
            _inputToStepMapper.resetTouch();
        }
    };

    var play = function(e) {
        var zone1x = getZoneX(e.touches ,1);
        var zone0y = getZoneY(e.touches ,0);
        var zonem1y = getZoneY(e.touches ,-1);
        var currentX = 0; //Frequency
        var currentY = 0; //Volume
        redrawScene(); //Temporary
        if(zone1x.length === 0) {
            //_audioController.setFrequency(_frequencyRange.getMinimum());
        } else {
            zone1x.forEach(function (xZone1) {
                if (xZone1 > currentX) {
                    currentX = xZone1;
                }
            });
            var touchPercentage = (currentX - _canvas.zone[1].x1) / (_canvas.zone[1].x2 - _canvas.zone[1].x1);
            var frequency = _inputToStepMapper.calculateFrequencyFromTouch(touchPercentage);
            _context.fillText(touchPercentage, 200, 100);
            _audioController.setFrequency(frequency);
        }


        if (zonem1y.length !== 0) {
            _audioController.setVolume(0);
            _context.fillText('0', 200, 300);
        } else if (zone0y.length === 0) {
            //_audioController.setVolume(1);
        } else {
            zone0y.forEach(function (yZone2) {
                if (yZone2 > currentY) {
                    currentY = yZone2;
                }
            });
            var volume = 1-((currentY - _canvas.zone[0].y1) / (_canvas.zone[0].y2 - _canvas.zone[0].y1));
            _context.fillText(volume, 200, 300);
            _audioController.setVolume(volume);
        }
        _audioController.play();
    };

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
    };

    var handleOptionStart = function(e) {
        if (_currentPanel !== 0) {
            switch(_currentPanel.getType()) {
                case 'Pitch':
                    _currentPanel.getRsPitch().handleStart(e);
                    break;
                case 'Waveform':
                    _currentPanel.getOssWaveform().handleStart(e);
                    break;
                case 'Detune':
                    _currentPanel.getSDetune().handleStart(e);
                    break;
                case 'Echo':
                    _currentPanel.getSEcho().handleStart(e);
                    break;
            }
        }
    };

    var handleOptionMove = function(e) {
        if (_currentPanel !== 0) {
            switch(_currentPanel.getType()) {
                case 'Pitch':
                    _currentPanel.getRsPitch().handleMove(e);
                    break;
                case 'Detune':
                    _currentPanel.getSDetune().handleMove(e);
                    break;
                case 'Echo':
                    _currentPanel.getSEcho().handleMove(e);
                    break;
            }
        }
    };

    var handleOptionEnd = function(e) {
        if (_currentPanel !== 0) {
            switch(_currentPanel.getType()) {
                case 'Pitch':
                    _currentPanel.getRsPitch().handleEnd(e);
                    break;
                case 'Detune':
                    _currentPanel.getSDetune().handleEnd(e);
                    break;
                case 'Echo':
                    _currentPanel.getSEcho().handleEnd(e);
                    break;
            }
        }
    };

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
    };

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
    };

    this.switchPower = function() {
        _powerIsOn = !_powerIsOn;
        if (_powerIsOn) {
            _audioController.setFrequency(this.getFrequencyMin());
            _audioController.setVolume(1);
        }
    };

    this.powerIsOn = function () {
        return _powerIsOn;
    };

    this.switchBitcrusher = function() {
        _bitcrusherIsOn = !_bitcrusherIsOn;
        _audioController.setEnableBitcrusher(_bitcrusherIsOn);
    };

    this.bitcrusherIsOn = function () {
        return _bitcrusherIsOn;
    };

    this.switchContinuous = function() {
        _continuousIsOn = !_continuousIsOn;
    };

    this.continuousIsOn = function () {
        return _continuousIsOn;
    };

    this.getFrequencyMin = function() {
        return _frequencyRange.getMinimum();
    };

    this.setFrequencyMin = function(frequencyMin) {
        _frequencyRange.setMinimum(frequencyMin);
    };

    this.getFrequencyMax = function() {
        return _frequencyRange.getMaximum();
    };

    this.setFrequencyMax = function(frequencyMax) {
        _frequencyRange.setMaximum(frequencyMax);
    };

    this.setMappedStepList = function() {
        _frequencyRange = new FrequencyRange(this.getFrequencyMin(), this.getFrequencyMax());
        _mappedStepList = _inputToStepMapper.selectFrequencyRange(_frequencyRange);
    };

    this.getEcho = function() {
        return _echo;
    };

    this.setEcho = function(echo) {
        _audioController.setEchoDelay(echo);
        _echo = echo;
    };

    this.getDetune = function() {
        return _detune;
    };

    this.setDetune = function(detune) {
        _audioController.setDetune(detune);
        _detune = detune;
    };

    window.onload = function() {
        this.init();
    };

    window.onresize = function(event) {
        this.createCanvas();
        this.createButtons();
        this.redrawScene();
    };
}());