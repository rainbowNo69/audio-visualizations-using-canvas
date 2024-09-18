const fileInput = document.getElementById('audioUpload');
const canvas = document.getElementById('fountainCanvas');
const ctx = canvas.getContext('2d');
let audioContext, analyser, source, bufferLength, dataArray;

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const audioData = e.target.result;
      initAudio(audioData);
    };
    reader.readAsArrayBuffer(file);
  }
}

function initAudio(audioData) {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  audioContext.decodeAudioData(audioData, buffer => {
    source = audioContext.createBufferSource();
    analyser = audioContext.createAnalyser();

    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    source.start();
    animateFountain();
  });
}

function animateFountain() {
  requestAnimationFrame(animateFountain);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const barWidth = (canvas.width / bufferLength) * 2.5;
  let x = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];
    const color = `rgb(${barHeight + 100},50,${barHeight + 150})`;

    ctx.fillStyle = color;
    ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

    x += barWidth + 1;
  }
}
