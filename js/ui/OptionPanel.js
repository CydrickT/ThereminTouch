function OptionPanel(xButton, yButton, type){
    var _canvas = getCanvas();
    var _context = getContext();
    var _type = type;
    var _WIDTHMULTIPLIER = 900;
    var _x = xButton-_WIDTHMULTIPLIER*_canvas.width/2736;
    var _y = yButton-400*_canvas.height/1824;
    var _width = _WIDTHMULTIPLIER*2*_canvas.width/2736;
    var _height = 300*_canvas.height/1824;
    var _fontSize = 28*_canvas.height/1824;
    var _lineWidth = 11*_canvas.width/2736;
    var _isOpen = false;

    var _MINFREQUENCY = 20;
    var _MAXFREQUENCY = 2000;
    var _MINDETUNE = -100;
    var _MAXDETUNE = 100;
    var _MAXECHO = 1000;

    var _waveforms = getAudioController().getWaveformTypesAsString();
    var _rsPitch = new RangeSlider(_x, _x+_width, _y+(0.7*_height),_MINFREQUENCY,_MAXFREQUENCY,getFrequencyMin(),getFrequencyMax());
    var _ossWaveform = new OptionSingleSelect(_x, _y, _x+_width, _waveforms, 'black');
    var _sDetune = new Slider(_x, _x+_width, _y+(0.7*_height),_MINDETUNE,_MAXDETUNE,getDetune());
    var _sEcho = new Slider(_x, _x+_width, _y+(0.7*_height),0,_MAXECHO,getEcho());

    this.draw = function() {
        this.shape();
        _context.fillStyle = '#E6E6E6';
        _context.fill();
        _context.lineWidth = _lineWidth;
        _context.strokeStyle = 'black';
        _context.stroke();
        _isOpen = true;
        this.addContent();
    }

    this.shape = function() {
        _context.beginPath();
        _context.rect(_x, _y, _width, _height);
    }

    this.checkNotTouch = function(x, y) {
        this.shape();
        return !_context.isPointInPath(x, y);
    }

    this.isOpen = function() {
        return _isOpen;
    }

    this.addContent = function() {
        var text = '';
        switch (_type)
        {
            case "Pitch":
                text = 'Select the pitch (Hz):';
                _rsPitch.draw();
                break;
            case "Waveform":
                text = 'Select a waveform:';
                _ossWaveform.draw();
                break;
            case "Detune":
                text = 'Select the detune (???):';
                _sDetune.draw();
                break;
            case "Echo":
                text = 'Select the echo (ms):';
                _sEcho.draw();
                break;
            case "Bitcrusher":
                break;
            case "Power":
                break;
        }
        this.drawText(text);
    }

    this.getType = function() {
        return _type;
    }

    this.getRsPitch = function() {
        return _rsPitch;
    }

    this.getOssWaveform = function() {
        return _ossWaveform;
    }

    this.getSDetune = function() {
        return _sDetune;
    }

    this.getSEcho = function() {
        return _sEcho;
    }

    this.drawText = function(text) {
        _context.font = 'bold '+_fontSize+'pt Calibri';
        _context.textAlign = 'left';
        _context.fillStyle = 'black';
        _context.fillText(text, _x+(0.1*_width), _y+(0.2*_height));
    }
}
