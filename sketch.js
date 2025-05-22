// =======================
// Virtual PhotoBooth by Suri!
// This is a real-time webcam photo booth with five filters (black & white, green screen, generative art background, inverted colors, none). The camera counts down then lets the user export a 4 shot collage with customizable frame color.
// =======================

let video;
let button;
let newButton;
let downloadButton;
let filterButtons = [];
let photos = [];
let takingPhotos = false;
let countdown = 0;
let photoTaken = false;
let photoIndex = 0;
let interval;
let currentFilter = "none";
let bodySegmentation;
let segmentation;
let bodySegmentationReady = false;
let bgGraphics;
let bgColorPicker, bgColorLabel;
let uploadLabel, uploadInput;
let borderColorPicker, borderLabel;
let genArtGraphics;
let ranges;
let seedArt = Math.random() * 12; 
let tSpeed = 0.02; 
let colors1 = "f8c8dc-fce1e4-fcf4d9-e3f2c1-c6e2e9".split("-").map(a => "#" + a);
let colors2 = "a8dadc-ffafcc-bde0fe-cdb4db-ffc8a2-ffb4a2-ffdac1-cdeacd-a2d2ff-d4a373-b7e4c7-d8e2dc-f1c0e8-eac4d5".split("-").map(a => "#" + a);
let color1Art, color2Art;

function preload() {
  // Initialize the body segmentation model for green screen and generative art filters
  let options = { maskType: "background" };
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options, () => {
    bodySegmentationReady = true;
    // Start continuously detecting segmentation 
    bodySegmentation.detectStart(video, gotResults);
  });
}

function setup() {
  // Main canvas for UI
  createCanvas(900, 500);
  // Semi-transparent green background to indicate setup phase
  background('rgba(0, 255, 0, 0.25)');
  textFont('Alata'); // Set default font for text UI

  // Setup webcam capture
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide(); 

  // Create a green screen background graphic matching video preview
  bgGraphics = createGraphics(video.width, video.height);
  bgGraphics.background(0, 255, 0);

  // Create a canvas for generative art background
  genArtGraphics = createGraphics(video.width, video.height);
  genArtGraphics.background(0);
  randomSeed(seedArt);
  noiseSeed(seedArt);
  ranges = 200;
  color1Art = random(colors1);
  color2Art = random(colors2);

  // Setup camera button as an image
  button = createImg('camera.png', 'Take Photos');
  button.position(220, 320);
  button.size(50, 50);
  button.mousePressed(startPhotoBooth);

  // "Take New Photos" button for resetting the booth
  newButton = createButton("Take New Photos!");
  newButton.style("font-family", "Alata");
  newButton.position(140, 320);
  newButton.style("background-color", "#71e0e9");  
  newButton.style("border", "3px solid white");
  newButton.style("font-size", "25px");
  newButton.mousePressed(resetToHomePage);
  newButton.hide(); // Hide until after a session

  downloadButton = createImg('download.png', 'Download Photos');
  downloadButton.position(width - 120, 200);
  downloadButton.size(70, 70);
  downloadButton.mousePressed(downloadCollage);
  downloadButton.hide();

  // Label for filter controls
  createP("FILTERS").style('font-family','Alata').position(215, 370);

  // Define filter types and their icons/colors
  let filterTypes = [
    { name: "bw",    color: "black", icon: null },
    { name: "green", color: "green", icon: null },
    { name: "face",               icon: "art.png" },
    { name: "invert",             icon: "invert.png" }, 
    { name: "none",               icon: "none.png" }    
  ];
  // Create buttons for each filter
  filterTypes.forEach((filter, idx) => {
    let btn = createButton("");
    btn.position(130 + idx * 50, 410);
    btn.size(40, 40);
    if (filter.icon) {
      // Use icon if provided
      btn.style("background-image", `url(${filter.icon})`);
      btn.style("background-size", "cover");
    } else {
      // Otherwise color fill
      btn.style("background-color", filter.color);
    }
    btn.style("border-radius", "50%"); // Make circular
    btn.mousePressed(() => applyFilter(filter.name, btn));
    filterButtons.push(btn);
  });

  // UI for green screen color picker
  bgColorLabel = createP("Choose background color");
  bgColorLabel.style('font-family','Alata').position(420, 30);
  bgColorPicker = createColorPicker('#00FF00');
  bgColorPicker.position(420, 70);
  bgColorPicker.input(() => bgGraphics.background(bgColorPicker.color()));

  // File input for uploading custom green screen background
  uploadLabel = createP("Upload a background");
  uploadLabel.style('font-family','Alata').position(420, 90);
  uploadInput = createFileInput(handleFile);
  uploadInput.position(420, 130);

  // UI for choosing frame border color
  borderLabel = createP("Choose photo frame color");
  borderLabel.style('font-family','Alata').position(420, 200);
  borderColorPicker = createColorPicker('#FFFFFF');
  borderColorPicker.position(420, 240);

  // Hide advanced controls until needed
  bgColorLabel.hide(); 
  bgColorPicker.hide();
  uploadLabel.hide(); 
  uploadInput.hide();
  borderLabel.hide(); 
  borderColorPicker.hide();

  // Ensure all buttons and paragraphs use the same font
  selectAll('button').forEach(b => b.style('font-family', 'Alata'));
  selectAll('p').forEach(p => p.style('font-family', 'Alata'));
}

function gotResults(result) {
  // Callback for segmentation results
  segmentation = result;
}

function setSeed() {
  // Reset random seeds for consistent generative art
  randomSeed(seedArt);
  noiseSeed(seedArt);
}

function updateGenArt() {
  // Draw one frame of generative art background
  genArtGraphics.push();
  setSeed();
  genArtGraphics.blendMode(DIFFERENCE);
  genArtGraphics.noFill();
  genArtGraphics.strokeWeight(random(1, 30));
  let t = frameCount * tSpeed + mouseX * 0.005;
  for (let i = 0; i < ranges; i++) {
    genArtGraphics.stroke(color2Art);
    genArtGraphics.drawingContext.shadowColor = random(colors1);
    genArtGraphics.drawingContext.shadowOffsetX = 1;
    genArtGraphics.drawingContext.shadowOffsetY = 1;
    genArtGraphics.drawingContext.shadowBlur = 0;
    genArtGraphics.beginShape();
    for (let x = -100; x < video.width + 200; x += 100) {
      let n = noise(x * 0.005, i * 0.01, t);
      let wave = sin(x * 0.01 + t) * 50;
      let y = map(n, 0, 1, video.height/4, video.height*3/4) + wave;
      genArtGraphics.curveVertex(x, y);
    }
    genArtGraphics.endShape();
  }
  genArtGraphics.pop();
  genArtGraphics.blendMode(BLEND);
}

function applyFilter(filterName, btn) {
  // Change the current filter and update button styles
  currentFilter = filterName;
  filterButtons.forEach(b => b.style("border", "none"));
  btn.style("border", "3px solid white");

  // Show or hide green screen controls based on filter
  let isGreen = filterName === "green";
  bgColorLabel.style('display', isGreen ? 'block' : 'none');
  bgColorPicker.style('display', isGreen ? 'block' : 'none');
  uploadLabel.style('display', isGreen ? 'block' : 'none');
  uploadInput.style('display', isGreen ? 'block' : 'none');

  // Hide frame picker until after a session
  borderLabel.hide();
  borderColorPicker.hide();
}

function handleFile(file) {
  // Load and set uploaded image as green screen background
  if (file.type === 'image') {
    loadImage(file.data, img => bgGraphics.image(img, 0, 0, video.width, video.height));
  }
}

function startPhotoBooth() {
  // Initialize a new photo session if not already taking photos
  if (!takingPhotos) {
    takingPhotos = true;
    photos = [];
    photoIndex = 0;
    countdown = 3;
    photoTaken = false;
    startCountdown();
    interval = setInterval(startCountdown, 4000); // schedule next shots
    button.hide();
  }
}

function startCountdown() {
  // Reset and begin the 3 second countdown 
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
  // Capture one photo with the current filter applied
  if (photoIndex < 4) {
    let imgCanvas = createGraphics(video.width, video.height);
    imgCanvas.push();
    imgCanvas.translate(video.width, 0);
    imgCanvas.scale(-1, 1);

    if ((currentFilter === "green" || currentFilter === "face") && segmentation) {
      // For green screen or face art, mask out background or apply art using body segmentation
      let bg = currentFilter === "green" ? bgGraphics : genArtGraphics;
      updateGenArt();
      let masked = video.get();
      masked.mask(segmentation.mask.get());
      imgCanvas.image(bg, 0, 0, video.width, video.height);
      imgCanvas.image(masked, 0, 0, video.width, video.height);
    } else {
      // Default: draw live video, then apply bw or invert via filters
      imgCanvas.image(video, 0, 0, video.width, video.height);
      if (currentFilter === "bw") imgCanvas.filter(GRAY);
      if (currentFilter === "invert") imgCanvas.filter(INVERT);
    }
    imgCanvas.pop();
    photos.push(imgCanvas.get()); // save captured frame
    photoTaken = true;
    photoIndex++;
    if (photoIndex >= 4) {
      // End session after 4 photos
      takingPhotos = false;
      clearInterval(interval);
      borderLabel.show();
      borderColorPicker.show();
      newButton.show();
      downloadButton.show();
    }
  }
}

function downloadCollage() {
  // Compile and save a vertical collage of the 4 photos
  let w = 120;
  let h = 90;
  let gap = 10;
  let totalHeight = h * photos.length + gap * (photos.length - 1);
  let collage = createGraphics(w + 12, totalHeight + 12);
  collage.pixelDensity(1);
  // Draw border using selected frame color
  collage.stroke(borderColorPicker.color());
  collage.strokeWeight(12);
  collage.noFill();
  collage.rect(0, 0, w + 12, totalHeight + 12);
  // Place each photo inside the frame
  collage.noStroke();
  photos.forEach((p, i) => {
    collage.image(p, 6, 6 + i * (h + gap), w, h);
  });
  save(collage, 'photo_booth_collage.png');
}

function resetToHomePage() {
  // Reset all state to allow taking new photos
  photos = [];
  photoIndex = 0;
  takingPhotos = false;
  countdown = 0;
  photoTaken = false;
  button.show();
  newButton.hide();
  downloadButton.hide();
  filterButtons.forEach(b => b.style("border", "none"));
  currentFilter = "none";
  bgColorLabel.hide(); bgColorPicker.hide();
  uploadLabel.hide(); uploadInput.hide();
  borderLabel.hide(); borderColorPicker.hide();
}

function draw() {
  background('rgb(252, 245, 180)');

  // Update generative art in live preview if active
  if (currentFilter === "face") updateGenArt();

  // Create a mirrored live preview of the webcam
  let preview = createGraphics(video.width, video.height);
  preview.push();
  preview.translate(video.width, 0);
  preview.scale(-1, 1);
  if ((currentFilter === "green" || currentFilter === "face") && segmentation) {
    let bg = currentFilter === "green" ? bgGraphics : genArtGraphics;
    let masked = video.get();
    masked.mask(segmentation.mask.get());
    preview.image(bg, 0, 0, video.width, video.height);
    preview.image(masked, 0, 0, video.width, video.height);
  } else {
    preview.image(video, 0, 0, video.width, video.height);
    if (currentFilter === "bw") preview.filter(GRAY);
    if (currentFilter === "invert") preview.filter(INVERT);
  }
  preview.pop();
  image(preview, 90, 50); // Draw preview on main canvas

  // Show countdown number on screen during photo capture
  if (takingPhotos && countdown > 0 && !photoTaken) {
    textFont('Alata');
    textSize(64);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    stroke(0);
    strokeWeight(8);
    fill(255);
    text(countdown, 90 + video.width/2, 50 + video.height/2);
    noStroke();
    textStyle(NORMAL);
  }

  // Display taken photos with frame strokes
  let x = width - 280;
  let yTop = 50;
  let w = 120;
  let h = 90;
  let gap = 10;
  if (photos.length > 0) {
    stroke(borderColorPicker.color()); strokeWeight(12); noFill();
    let totalHeight = h * photos.length + gap * (photos.length - 1);
    rect(x - 6, yTop - 6, w + 12, totalHeight + 12);
    for (let i = 1; i < photos.length; i++) {
      let yLine = yTop + i * (h + gap) - gap / 2;
      line(x - 6, yLine, x + w + 6, yLine);
    }
    noStroke();
    photos.forEach((p, i) => image(p, x, yTop + i * (h + gap), w, h));
  }
}
