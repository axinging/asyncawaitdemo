'use strict';
// 'https://i.stack.imgur.com/RPEQQ.png';

async function main() {
  let localBuild = ['core', 'cpu', 'webgpu', 'webgl', 'tfjs-converter'];
  await loadTFJS(localBuild);
  await testDraw();
  await testDrawAlpha();
}

async function testDrawAlpha() {
  let backendName = 'cpu';
  await tf.setBackend(backendName);
  await tf.ready();
  tfdraw = true;
  drawContextType = getContextName(backendName);
  let dataURL1, dataURL2;
  {
    const canvas = document.getElementById('alphacanvas');
    await drawBackground(canvas, 0.3);
    dataURL1 = canvas.toDataURL();
  }
  {
    const canvas = document.getElementById('alpha2canvas');
    await drawBackground(canvas, 0.9);
    dataURL2 = canvas.toDataURL();
  }
  if (dataURL1 === dataURL2) {
    console.error('Opacity not work!');
  }
}

async function testDraw() {
  let backendName = 'cpu';
  await tf.setBackend(backendName);
  await tf.ready();
  drawContextType = getContextName(backendName);
  {
    tfdraw = false;
    const canvas = getCanvas();
    await drawBackground(canvas);
    await drawForground(canvas);
  }
  readBackTFDrawTest();
  {
    tfdraw = true;
    const canvas = getTFCPUCanvas();
    await drawBackground(canvas, 0.0);
    await drawForground(canvas);
  }

  backendName = 'webgpu';
  await tf.setBackend(backendName);
  await tf.ready();
  drawContextType = getContextName(backendName);
  {
    tfdraw = true;
    const canvas = getTFWebGPUCanvas();
    await drawBackground(canvas);
    await drawForground(canvas);
  }
}

function getCanvas() {
  return document.getElementById('canvas');
}

function getTFCPUCanvas() {
  return document.getElementById('tfcpucanvas');
}

function getTFWebGPUCanvas() {
  return document.getElementById('tfwebgpucanvas');
}

const IMG_OPAQUE = 'RPEQQ_opaque.jpg';
const IMG_TRANSPARENT = 'RPEQQ.png';
var drawContextType = 'webgpu';
const width = 48;
const height = 48;
let tfdraw = true;

async function drawForground(canvas, alpha = 1.0) {
  if (tfdraw) {
    // This is not transparent.
    const [imageData, w, h] = await ImageURLToImageData(IMG_TRANSPARENT);
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha}
    });
  } else {
    var context = canvas.getContext('2d');
    // This is transparent.
    const img = new Image();
    img.src = IMG_TRANSPARENT;
    await img.decode();
    context.drawImage(img, 0, 0);
    // This is not transparent.
    /*
    const [img, w, h] = await ImageURLToImageData(IMG_TRANSPARENT);
    context.putImageData(img, 0, 0);
    */
  }
}

async function drawBackground(canvas, alpha = 1.0) {
  if (tfdraw) {
    // const imageData = ImageToData(img);
    const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha}
    });
  } else {
    const img = new Image();
    img.src = IMG_OPAQUE;
    await img.decode();
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
  }
}

function ImageDataToImage(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  console.log(imageData);
  // Convert the canvas element to an image object
  const image = new Image();
  image.src = canvas.toDataURL();
  console.log(image.src);
  return image;
}

// https://stackoverflow.com/questions/36588722/html-canvas-putimagedata-with-transparency-causes-incorrect-rgb-to-be-saved
function readBackTFDrawTest() {
  if (drawContextType !== '2d') return;
  const canvas = document.createElement('canvas');
  var ct = canvas.getContext('2d');
  var data = [];
  data[0] = 200;      // r
  data[1] = 100;      // g
  data[2] = 50;       // b
  data[3] = 25;       // a
  console.log(data);  //[200, 100, 50, 25].
  const img = tf.tensor3d(data, [1, 1, 4], 'int32');
  tf.browser.draw(img, canvas, {contextOptions: {contextType: '2d'}});

  // ct.putImageData(image, 0, 0);
  var debug = ct.getImageData(0, 0, 1, 1);

  console.log(debug.data);  //[204, 102, 51, 25]
}

async function ImageURLToImageData(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  return [
    context.getImageData(0, 0, canvas.width, canvas.height), img.naturalWidth,
    img.naturalHeight
  ];
}

function ImageToData(img) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  console.log(canvas.width + ', ' + canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function getContextName(backendName) {
  if (backendName === 'cpu') {
    return '2d';
  } else if (backendName === 'webgpu') {
    return 'webgpu';
  }
}
