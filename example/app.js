var target = document.getElementById('draggable');
var ctx = typeof AudioContext == 'undefined' ? new webkitAudioContext() : new AudioContext();
var seq = new Sequencer(ctx);

var vm = new Vue({
  el: "#sequencer",
  data: {
    tempo: seq.getTempo(),
    numSlots: seq.getNumSlots(),
    playing: seq.playing,
    items: seq.items
  },
  methods: {
    changeTempo: function(item, e) {
      seq.setTempo(item.tempo = e.target.value);
    },
    changeNumSlots: function(item, e) {
      seq.setNumSlots(item.numSlots = e.target.value);
    },
    changeNumPulses: function(item, e) {
      item.numPulses = e.target.value;
    },
    toggle: function(item) {
      seq.playing ? seq.stop() : seq.start();
      item.playing = seq.playing;
    }
  }
});

['a', 'b', 'c'].forEach(function(name) {
  var request = new XMLHttpRequest();

  request.open('GET', name + '.mp3', true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    ctx.decodeAudioData(request.response, function(buf) {
      seq.add(new Item(buf, name));
    });
  };
  request.send(null);
});

function dragOverHandler(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
}

function dropHandler(event) {
  var files = event.dataTransfer.files;

  event.stopPropagation();
  event.preventDefault();

  Array.prototype.forEach.call(files, function (file) {
    if(file.type.match(/audio\/(mp3|mpeg)/)) {
      var reader = new FileReader();

      reader.addEventListener('load', function (event) {
        var data = event.target.result;

        ctx.decodeAudioData(data, function(buffer) {
          seq.add(new Item(buffer, file.name));
        });
      });
      reader.readAsArrayBuffer(file);
    }
  });
}

target.addEventListener('dragover', dragOverHandler);
target.addEventListener('drop', dropHandler);

