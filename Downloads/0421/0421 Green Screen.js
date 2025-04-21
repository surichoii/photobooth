let bodySegmentation;
let video;
let segmentation;

let options = {
  maskType: "background",
};

function preload() {
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);
}

function setup() {
  createCanvas(640, 480);
  // Create the video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  bodySegmentation.detectStart(video, gotResults);
}

function draw() {
  background(0, 0, 255);
  if (segmentation) {
    video.mask(segmentation.mask);
    image(video, 0, 0);
  }
}

// callback function for body segmentation
function gotResults(result) {
  segmentation = result;
}
