let video;
let button;
let newButton;
let filterButtons = [];
let photos = [];
let takingPhotos = false;
let countdown = 0;
let photoTaken = false;
let photoIndex = 0;
let interval;
let currentFilter = "none";
let img;

function preload() {
  img = loadImage('earring.png');
}

function setup() {
  createCanvas(900, 500);
  background('rgba(0, 255, 0, 0.25)');
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.style('transform', 'scale(-1, 1)');
  video.hide();
  
  button = createImg('camera.png', 'Take Photos');
  button.position(220, 320);
  button.size(50, 50);
  button.mousePressed(startPhotoBooth);
  
  newButton = createButton("Take New Photos!");
  newButton.position(220, 320);
  newButton.mousePressed(resetToHomePage);
  newButton.hide();
  
  createP("FILTERS").position(215, 370);
  
  let filterTypes = [
    { name: "bw", color: "black" },
    { name: "green", color: "green" },
    { name: "face", color: "white", icon: "earring.png" },
    { name: "none", icon: "none.jpg" }
  ];
  
  filterTypes.forEach((filter, index) => {
    let btn = createButton("");
    btn.position(150 + index * 50, 410);
    btn.size(40, 40);
    if (filter.icon) {
      btn.style("background-image", `url(${filter.icon})`);
      btn.style("background-size", "cover");
    } else {
      btn.style("background-color", filter.color);
    }
    btn.style("border-radius", "50%");
    btn.mousePressed(() => applyFilter(filter.name, btn));
    filterButtons.push(btn);
  });
}

function applyFilter(filterName, btn) {
  currentFilter = filterName;
  filterButtons.forEach(b => b.style("border", "none"));
  btn.style("border", "3px solid white");
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
  currentFilter = "none";
  filterButtons.forEach(b => b.style("border", "none"));
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
    
    if (currentFilter === "bw") {
      img.filter(GRAY);
    }
    
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
  background('rgb(252, 245, 180)');
  push();
  scale(-1, 1);
  let tempImg = video.get();
  if (currentFilter === "bw") {
    tempImg.filter(GRAY);
  } else if (currentFilter === "green") {
    tempImg = createGraphics(320, 240);
    tempImg.background("green");
    tempImg.push();
    tempImg.translate(320, 0);
    tempImg.scale(-1, 1);
    tempImg.image(video, 0, 0);
    tempImg.pop();
  }
  image(tempImg, -410, 50);
  pop();
  
  if (currentFilter === "face") {
    drawFaceFilter();
  }
  
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

function drawFaceFilter() {
  let x = width / 2 - 12;
  let y = height / 2 - 12;
  image(img, x, y, 25, 25);
}









