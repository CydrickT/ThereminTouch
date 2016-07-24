/**
 *
 *
 * Useful resources:
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
 * http://akirayoungblood.com/projects/custom-waves/
 * http://www.html5rocks.com/en/tutorials/casestudies/jamwithchrome-audio/
 *
 * Good values:
 * Feedback node: 0.25
 * Wet Level node: 0.25
 * Delay: 0.15
 * @constructor
 */
function AudioController(){

	var _WAVEFOROM_TYPES_STRING = ["Sine", "Squared", "Sawtooth", "Triangular", "Guitar", "Soft guitar", "Clarinet"];

	var _REGULAR_WAVEFOROM_TYPES = ["sine", "square", "sawtooth", "triangle"];

	/**
	 * These custom waveforms are the work of Akira Youngblood. http://akirayoungblood.com/projects/custom-waves/
	 * @type {*[]}
	 * @private
     */
	var _CUSTOM_WAVEFORM = [
		{ 	//Guitar
			real: new Float32Array([0,0,  0,0,0,0,   0,   0]),
			imag: new Float32Array([0,1,0.8,0,0,0,-0.1,-0.1])
		},
		{	//Soft guitar
			real: new Float32Array([0,0,-0.26]),
			imag: new Float32Array([0,1,    0])
		},
		{	//Clarinet
			real: new Float32Array([0,0,0,   0,0,   0,0,   0,0,   0,0,   0,0,   0,0,   0]),
			imag: new Float32Array([0,1,0,0.64,0,0.32,0,0.16,0,0.08,0,0.04,0,0.02,0,0.01])
		}
	];

	var _started = false;
	var _built = false;
	var _currentEffectiveVolume = 1;
	var _reverbConnected = false;

	var _audioCtx;
	var _oscillatorNode;
	var _delayNode;
	var _mergeNode;
	var _volumeNode;
	var _feedbackNode;
	var _wetLevelNode;
	var _bitcrusherNode;
	var _endNode;

	var _bitcrusherConnectorStart;
	var _bitcrusherConnectorEnd;



	/*

	Node connection graph:

	 +-----+       +--------------+       +----------+             +---------+      +-------------------------+      +--------------+        +----------------------+    +-------+
	 |Start+------->OscillatorNode+------->VolumeNode+------------->MergeNode+------> BitcrusherConnectorStart+------>BitcrusherNode+-------->BitcrusherConnectorEnd+---->EndNode|
	 +-----+       +--------------+       +----+-----+             +-----^---+      +-------------------------+      |   Optionnal  |        +----------------------+    +-------+
	                                           |                         |                                           +--------------+
	                                           |                         |
	                                       +---v-----+              +----+-------+
	                                       |DelayNode+-------------->WetLevelNode|
	                                       +-+---^---+              +------------+
	                                         |   |
	                                         |   |
	                                       +-v---+------+
	                                       |FeedbackNode|
	                                       +------------+

		Note that the BitcrusherNode is connected or disconnected from the graph. When disconnected, BitcrusherConnectorStart is directly connected to BitcrusherConnectorEnd.
	 */
	this._build = function(){
		if (_built === false){
			_built = true;

			// Node building
			_audioCtx = this._getAudioContext();
			_oscillatorNode = _audioCtx.createOscillator();
			_volumeNode = _audioCtx.createGain();
			_delayNode = _audioCtx.createDelay();
			_feedbackNode = _audioCtx.createGain();
			_wetLevelNode = _audioCtx.createGain();
			_mergeNode = _audioCtx.createGain();
			_bitcrusherConnectorStart = _audioCtx.createGain();
			_bitcrusherConnectorEnd = _audioCtx.createGain();
			_bitcrusherNode = this._buildBitcrusherNode(_audioCtx);
			_endNode = _audioCtx.createGain();

			// Node chaining
			_oscillatorNode.connect(_volumeNode);
			_volumeNode.connect(_mergeNode);
			_volumeNode.connect(_delayNode);
			_delayNode.connect(_wetLevelNode);
			_delayNode.connect(_feedbackNode);
			_feedbackNode.connect(_delayNode);
			_wetLevelNode.connect(_mergeNode);
			_mergeNode.connect(_bitcrusherConnectorStart);
			_bitcrusherConnectorStart.connect(_bitcrusherConnectorEnd);
			_bitcrusherConnectorEnd.connect(_endNode);
			
			_oscillatorNode.start();
			_volumeNode.gain.value = 0;
			_endNode.connect(_audioCtx.destination);

		}
	};

	this._getAudioContext = function(){
		var ctx = null;
		try {
			ctx = new (window.AudioContext || window.webkitAudioContext)();
		}
		catch(err) {
			alert("Your browser does not support the audio API. Please upgrade to a *modern* browser:\n\n" +
				"https://www.google.com/chrome/browser/desktop/index.html\n"+
				"https://www.mozilla.org/en-US/firefox/\n"+
				"http://www.opera.com/\n"+
				"http://www.apple.com/ca/safari/");
		}

		return ctx;
	};

	/**
	 * Builds the bitcrusher node. Taken from NoiseHack:
	 * http://noisehack.com/custom-audio-effects-javascript-web-audio-api/
	 * @private
     */
	this._buildBitcrusherNode = function(audioContext){
		var bufferSize = 4096;
		var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
		node.bits = 4; // between 1 and 16
		node.normfreq = 0.1; // between 0.0 and 1.0
		var step = Math.pow(1/2, node.bits);
		var phaser = 0;
		var last = 0;
		node.onaudioprocess = function(e) {
			var input = e.inputBuffer.getChannelData(0);
			var output = e.outputBuffer.getChannelData(0);
			for (var i = 0; i < bufferSize; i++) {
				phaser += node.normfreq;
				if (phaser >= 1.0) {
					phaser -= 1.0;
					last = step * Math.floor(input[i] / step + 0.5);
				}
				output[i] = last;
			}
		};
		return node;
	};

	/**
	 * Resets this API with default values.
	 */
	this.setDefaults = function(){
		this.pause();
		this.setFrequency(220);
		this.setVolume(0.15);
		this.setDetune(0);
		this.setWaveformType(0);
		this.setEchoDelay(0.2);
		this.setFeedbackPercentage(0.25);
		this.setWetLevelPercentage(0.25);
		this.setEnableBitcrusher(false);
	};


	/**
	 * Gets all the available waveforms as user-friendy strings.
	 * @returns {string[]}
     */
	this.getWaveformTypesAsString = function(){
		return _WAVEFOROM_TYPES_STRING;
	};

	/*
	 *	Node modification functions
	 */

	/**
	 * Sets the waveform type to the oscillator
	 * @param index the index from the array obtained by getWaveformTypesAsString();
     */
	this.setWaveformType = function(index){
		if (index < _REGULAR_WAVEFOROM_TYPES.length){
			_oscillatorNode.type = _REGULAR_WAVEFOROM_TYPES[index];
		}
		else{
			var newIndex = index - _REGULAR_WAVEFOROM_TYPES.length;
			_oscillatorNode.setPeriodicWave(_audioCtx.createPeriodicWave(_CUSTOM_WAVEFORM[newIndex].real,_CUSTOM_WAVEFORM[newIndex].imag));
		}
	};

	/**
	 * Sets the frequency to play
	 * @param frequency the frequency to play. Typical human can hear frequency from 20 to 20 000, but I wouldn't recommend a value over 500
     */
	this.setFrequency = function(frequency){
		_oscillatorNode.frequency.value = frequency;
	};

	/**
	 * Sets the volume
	 * @param volume Volume in percentage [0, 1]
     */
	this.setVolume = function(volume){
		_currentEffectiveVolume = volume;
		if (_started === true){
			_volumeNode.gain.value = volume;
		}
	};

	/**
	 * Sets the detune of the frequency
	 * @param detune A value in cents. Can be negative, positive or above/below 100
     */
	this.setDetune = function(detune){
		_oscillatorNode.detune.value  = detune;
	};

	/**
	 * Sets the delay between two echoes.
	 * @param delay the delay in milliseconds
     */
	this.setEchoDelay = function(delay){
		_delayNode.delayTime.value  = (delay / 1000);
	};

	/**
	 * Sets the percentage of feedback from the original tune you're getting back. Do not put a value over 1, or the sound will always increase.
	 * @param percentage the percentage. [0, 1]
     */
	this.setFeedbackPercentage = function(percentage){
		_feedbackNode.gain.value = percentage;
	};

	/**
	 * The wet level percentage.
	 * @param percentage the percentage. [0, 1]
	 */
	this.setWetLevelPercentage = function(percentage){
		_wetLevelNode.gain.value = percentage;
	};



	/*
	 Node enabling / disabling functions
	 */

	/**
	 * 	Bitcrusher effect
	 *	Taken from http://noisehack.com/custom-audio-effects-javascript-web-audio-api/
	 * @param enabled A boolean saying if the Bitcrusher effect should be enabled or not.
     */
	this.setEnableBitcrusher = function(enabled){
		if (enabled === true && _reverbConnected === false){
			_reverbConnected = true;
			_bitcrusherConnectorStart.disconnect(_bitcrusherConnectorEnd);
			_bitcrusherConnectorStart.connect(_bitcrusherNode);
			_bitcrusherNode.connect(_bitcrusherConnectorEnd);
		}else if (enabled === false && _reverbConnected === true){
			_reverbConnected = false;
			_bitcrusherConnectorStart.disconnect(_bitcrusherNode);
			_bitcrusherNode.disconnect(_bitcrusherConnectorEnd);
			_bitcrusherConnectorStart.connect(_bitcrusherConnectorEnd);

		}
	};

	/*
	 *	Play/Pause features
	 */
	/**
	 * Plays the frequency
	 */
	this.play = function(){
		if(_started === false){
			_started = true;
			this.setVolume(_currentEffectiveVolume);
		}
	};

	/**
	 * Stops the frequency
	 */
	this.pause = function(){
		if (_started === true){
			this.setVolume(0);
			_started = false;
		}
	};

	this._build();
	this.setDefaults();

}