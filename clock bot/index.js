const Canvas = require("canvas");
const BOJS = require("better-owop-js");
const fs = require("fs");
const util = require('util');
const moment = require("moment")

let bots = [];

let botCount = 3;

for (let i = 0; i < botCount; i++) {
  let bot = bots[i] = new BOJS.Client({
    //ws: "wss://owoppa.glitch.me",
    //adminlogin: "asdgang"
    log: i === 0
  });
  if(i === 0) {
    //bot.on("updatedPixels", console.log);
    //bot.on("updatedPlayers", console.log);
    //bot.on("playersLeft", console.log);
  }
  bot.setMaxListeners(0);
}
let queue = 0;
function next() {
  let bot = bots[queue++];

  if(!bot) bot = bots[(queue = 0)];
  return bot;
}
function setPixel(...args) {
  next().world.setPixel(...args);
}



const getIByXY = ((x, y, width) => ((x & width-1) + (y & width-1) * width));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function removeAlphaFromImgData(data) {
  if(data.length % 4 !== 0) throw new Error("Data is not image dat");

  let newData = new Uint8Array(data.length - data.length/4);
  for(let i = 0, i2 = 0; i < data.length;) {
      newData[i++] = data[i2++];
      newData[i++] = data[i2++];
      newData[i++] = data[i2++];
      i2++
  }
  return newData;
}
function addAlphaToData(data, alpha = 255) {
  if(data.length % 3 !== 0) throw new Error("Data is not data ;-;");
  let newData = new Uint8Array(data.length + data.length/3);

  for(let i = 0, i2 = 0; i < newData.length;) {
    newData[i++] = data[i2++];
    newData[i++] = data[i2++];
    newData[i++] = data[i2++];
    newData[i++] = alpha;
  }
  return newData;
}

function lerp(color1, color2, factor) {
  if (arguments.length < 3) {
    factor = 0.5;
  }
  var result = color1.slice();
  for (var i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};


function readImage(path) { // nobody cares if synced
  let img = new Canvas.Image();
  img.src = fs.readFileSync(path);

  let canvas = new Canvas.Canvas(img.width, img.height);
  let ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0);

  return ctx; // ctx has canvas in it already
}

function getImageFromContext(ctx, ...args) {
  let canvas = new Canvas.Canvas(background.canvas.width, background.canvas.height);
  let ctx2 = canvas.getContext("2d");

  let imageData = ctx.getImageData(...args);

  ctx2.putImageData(imageData, 0, 0);

  return canvas;
}


let _font = readImage("./font.png");
let background = readImage("./background.png");
let gate = readImage("./gate.png")
let lock = readImage("./lock.png")

let gateEnabled = false //<--- gate

let fontOffsetX = 0;
let fontChangeOffset = 16;
let font = {};


font[0] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[1] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[2] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[3] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[4] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[5] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[6] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[7] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[8] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font[9] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;

font["lightColon"] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font["darkColon"] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;
font["dark"] = getImageFromContext(_font, fontOffsetX, 0, fontChangeOffset, 41);
fontOffsetX+=fontChangeOffset;


/*for(let i in font) {
  let a = font[i];
  let canvas = new Canvas.Canvas(a.width, a.height);
  let ctx = canvas.getContext("2d");
  ctx.putImageData(a, 0, 0) // day1

  fs.writeFileSync("./bruh/"+i + ".png", canvas.toBuffer())
}*/

function generateClock(day1, day2, colon1, hour1, hour2, colon2, minute1, minute2) {
  let canvas = new Canvas.Canvas(background.canvas.width, gateEnabled ? background.canvas.height + gate.canvas.height : background.canvas.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(background.canvas, 0, 0);

  let clockOffsetXChange = 18;
  let offsetX = 5;
  let offsetY = 2;
  
  let gateOffsetX = 59;
  let lockOffsetX = 14;
  let lockOffsetY = 12;

  ctx.drawImage(font[day1], offsetX, offsetY) // day1
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[day2], offsetX, offsetY) // day2
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[(colon1 ? "light" : "dark") + "Colon"], offsetX, offsetY) // colon1
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[hour1], offsetX, offsetY) // hour1
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[hour2], offsetX, offsetY) // hour2
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[(colon2 ? "light" : "dark") + "Colon"], offsetX, offsetY) // colon2
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[minute1], offsetX, offsetY) // minute1
  offsetX += clockOffsetXChange;

  ctx.drawImage(font[minute2], offsetX, offsetY) // minute2
  offsetX += clockOffsetXChange;
  
  if (gateEnabled) {
    ctx.drawImage(gate, gateOffsetX, background.canvas.height)
    if (hours == "00" && minutes == "00" && seconds == "00") {
      ctx.drawImage(lock, gateOffsetX + lockOffsetX, background.canvas.height + lockOffsetY)
    }
  }

  return ctx;
}

//fs.writeFileSync("./ofo.png", generateClock(1, 2, true, 3, 4, false, 5, 5).canvas.toBuffer())


async function drawCtx(ctx, x, y) {
  let data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  //data = removeAlphaFromImgData(data);
  //console.log(data)
  let i = 0;
  for(let yy = 0; yy < ctx.canvas.height; yy++) {
    for(let xx = 0; xx < ctx.canvas.width; xx++) {
      let pixel = [data[i++], data[i++], data[i++], data[i++]];

      /*let onCanvas = await */bots[0].world.getPixel(xx + x, yy + y).then(onCanvas=>{
        //console.log(onCanvas)
        if(!onCanvas) return //continue; // better ojs has queue so should not happen

        let lerped = lerp(onCanvas, pixel.slice(0, 3), pixel[3]/255);

        //console.log(lerped, pixel);
        //process.exit();
        if(lerped[0] === onCanvas[0] && lerped[1] === onCanvas[1] && lerped[2] === onCanvas[2]) return//continue;

      /*bot.world.setPixel*/setPixel(xx + x, yy + y, lerped/*, false, false, false*/);
      }); // or then to make it faster but this is better i think

    }
  }
}

function parse(a) {
  a = a.toString();
  if(a.length < 2) a = "0" + a;
  a = a.split("");
  return a;
}

let end = moment(Date.now() + 1000 * 60 * 10);

let secondsOn = 5;
let on = secondsOn;


setInterval(() => {
  // clock
  let date = new Date();
  let hours = parse(date.getHours());


  let minutes = parse(date.getMinutes());


  let seconds = parse(date.getSeconds());
  /*let diff = end.diff(moment());
  if(diff < 0) diff = 0;
  //console.log(diff)
  let difference = moment.duration(diff);

  let hours = parse(difference.hours());


  let minutes = parse(difference.minutes());


  let seconds = parse(difference.seconds());*/

  //console.log(minutes, hours,seconds)

  let ctx = generateClock(...hours, on >= 0, ...minutes, on >= 0, ...seconds);
  //on--;
  //if(on < -secondsOn) on = secondsOn;
  //console.log(ctx)
  drawCtx(ctx, 352, 176);
}, 1500)


/*bot.on("id", async id => {
  //await sleep(1000);
  //bot.chat.send("/adminlogin asdgang");
  //drawCtx(generateClock(1, 2, true, 1, 2, true, 5, 5), 0, 0)
});*/
console.log("started " + Date.now());
