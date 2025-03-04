let video;
let button;
let newButton;
let photos = [];
let takingPhotos = false;
let countdown = 0;
let photoTaken = false;
let photoIndex = 0;
let interval;

function setup() {
  createCanvas(900, 500);
  background('rgba(0, 255, 0, 0.25)');
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.style('transform', 'scale(-1, 1)'); 
  video.hide();
  
  button = createButton("Take Photos!");
  button.position(220, 320);
  button.mousePressed(startPhotoBooth);
  
  newButton = createButton("Take New Photos!");
  newButton.position(220, 320);
  newButton.mousePressed(resetToHomePage);
  newButton.hide();
}

function startPhotoBooth() {
  if (!takingPhotos) {
    takingPhotos = true;
    photos = [];  
    photoIndex = 0;
    countdown = 3;
    photoTaken = false;
    startCountdown();
    interval = setInterval(startCountdown, 4000); 
    button.hide();  
  } else {
    resetProgram();  
  }
}

function resetProgram() {
  takingPhotos = false;
  clearInterval(interval);
  countdown = 0;
  photoIndex = 0;
  photoTaken = false;
  newButton.show(); 
}

function resetToHomePage() {
  newButton.hide();
  button.show();
  
  photos = [];
  photoIndex = 0;
  countdown = 0;
  takingPhotos = false;
}

function startCountdown() {
  countdown = 3;
  photoTaken = false;
  let countdownInterval = setInterval(() => {
    countdown--;
    if (countdown === 0) {
      clearInterval(countdownInterval);
      takePhoto();
    }
  }, 1000);
}

function takePhoto() {
  if (photoIndex < 4) {  
    let img = createGraphics(320, 240);
    img.push();
    img.translate(320, 0);
    img.scale(-1, 1);
    img.image(video, 0, 0);
    img.pop();
    photos.push(img.get()); 
    photoTaken = true;
  
    if (photos.length > 4) { 
      photos.shift();
    }
  
    photoIndex++;
    if (photoIndex >= 4) {
      resetProgram();  
      newButton.show();  
    }
  }
}

function draw() {
  background('rgb(255, 175, 175)');
  push();
  scale(-1, 1); 
  image(video, -430, 50);
  pop();
  
  if (takingPhotos && countdown > 0 && !photoTaken) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(countdown, 100 + 160, 70 + 120);
  }

  for (let i = 0; i < photos.length; i++) {
    image(photos[i], width - 300, 50 + i * 100, 120, 90);
  }
}




