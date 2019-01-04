//import { link } from "fs";

const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false})
        .then(localMediaStream => {
            console.log(localMediaStream);
            //set source - to be live, must be related to a URL
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            console.log('UH OH: \n', err);
        });
}

function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
    console.log(`video dimensions: \n ${width}w X ${height}h`);

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        //take pixels out
        let pixels = ctx.getImageData(0, 0, width, height);
        //alter pixels
        pixels = greenScreen(pixels);
        //return pixels
        ctx.putImageData(pixels, 0, 0);
        //1st pixel red, 2nd green, 3rd blue, 4th alpha
    }, 16);
}

function takePhoto() {
    snap.currentTime = 0;
    snap.play();

  const data = canvas.toDataURL('image/jpeg');
    //console.log(data); //print in base64 - text representation of photo
    //create link to download snapshot
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="Download Handsome" />`;
    strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
    for(let i = 0; i < pixels.data.length; i+=4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100;//RED channel
        pixels.data[i + 1] = pixels.data[i + 1] - 50;//GREEN channel
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5;//BLUE channel
        //organized in this order w/i object -> ALPHA would be pixels[i + 3]
    }
    return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();


video.addEventListener('canplay', paintToCanvas);
//npm start
