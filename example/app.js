var target = document.getElementById('draggable');
var ctx = typeof AudioContext == 'undefined' ? new webkitAudioContext() : new AudioContext();
var seq = new Sequencer(ctx);

seq.setTempo(73);
seq.setNumSlots(29);

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

['a:8', 'b:5', 'c:16', 'd:11', 'e:9'].forEach(function(item) {
  var name = item.split(/:/)[0];
  var numPulses = +item.split(/:/)[1];
  var request = new XMLHttpRequest();

  request.open('GET', name + '.mp3', true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    ctx.decodeAudioData(request.response, function(buf) {
      var item = new Item(buf, name);
      item.numPulses = numPulses;
      seq.add(item);
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
    if(file.type == 'audio/mp3') {
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


