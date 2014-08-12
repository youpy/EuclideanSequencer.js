'use strict';

var Calculator = require('./calculator');

var Sequencer = function(ctx) {
  this.ctx = ctx;
  this.items = [];
  this.calculator = new Calculator();
  this.offset = 0;
  this.playing = false;

  this._tempo = 120;
  this._numSlots = 16;
};

Sequencer.prototype.add = function(item) {
  this.items.push(item);
};

Sequencer.prototype.setTempo = function(tempo) {
  var playing = this.playing;

  if(playing) {
    this.stop();
  }

  this._tempo = tempo;

  if(playing) {
    this.start();
  }
};

Sequencer.prototype.setNumSlots = function(numSlots) {
  var playing = this.playing;

  if(playing) {
    this.stop();
  }

  this._numSlots = numSlots;

  if(playing) {
    this.start();
  }
};

Sequencer.prototype.getTempo = function() {
  return this._tempo;
};

Sequencer.prototype.getNumSlots = function() {
  return this._numSlots;
};

Sequencer.prototype.start = function() {
  // proceed ctx.currentTime
  var node = this.ctx.createOscillator();
  node.connect(this.ctx.destination);
  node.start(0);
  node.stop(0);

  var that = this;

  this.playing = true;
  this.offset = this.ctx.currentTime;
  this.beats = 0;
  this.lastBeatTime = 0;
  this.intervalId = setInterval(function() {
    var patterns = [],
        time = that.ctx.currentTime - that.offset,
        numSlots = that._numSlots,
        beatInterval = 60 / (that._tempo * (numSlots / 4));

    that.items.forEach(function(item) {
      patterns.push(that.calculator.calculate(item, numSlots));
    });

    while(that.lastBeatTime < time + 0.3) {
      var beatTime = that.beats * beatInterval;

      for(var i = 0; i < patterns.length; i ++) {
        if(patterns[i][that.beats % numSlots] == 1) {
          var node = that.ctx.createBufferSource();

          node.buffer = that.items[i].buffer;
          node.connect(that.ctx.destination);
          node.start(beatTime + that.offset);
        }
      }

      that.beats ++;
      that.lastBeatTime = beatTime;
    }
  }, 150);
};

Sequencer.prototype.stop = function() {
  this.playing = false;
  clearInterval(this.intervalId);
};

module.exports = Sequencer;

