const Canvas = require("canvas");
const fs = require("fs");
const util = require("util");

const BOJS = require("./index.js");



let writeFile = util.promisify(fs.writeFile);

if(!fs.existsSync("./images")) {
	fs.mkdirSync("./images")
}

let bot = new BOJS.Client({
	controller: true
})
bot.setMaxListeners(0);

function convertChunkToImageData(chunk, ctx) {
	let imgData = ctx.createImageData(16, 16);
	let i = 0;
	let i2 = 0;
	for (let yy = 0; yy < 16; yy++) {
		for (let xx = 0; xx < 16; xx++) {
			imgData.data[i2++] = chunk[i++];
			imgData.data[i2++] = chunk[i++];
			imgData.data[i2++] = chunk[i++];
			imgData.data[i2++] = 255; //factor thing
		}
	}
	return imgData;
}

let chunksBreak = 15000;

function requestArea(x1, y1, x2, y2) {
	x1 = Math.floor(x1/16);
	y1 = Math.floor(y1/16);
	x2 = Math.floor(x2/16);
	y2 = Math.floor(y2/16);

	console.log("requesting area");
	let i = 0;
	let chunksLasted = (x2 - x1) * (y2 - y1);
	
	return new Promise(async resolve => {
		for (let xx = x1; xx <= x2; xx++) {
			for (let yy = y1; yy <= y2; yy++) {
				i++
				bot.world.requestChunk(xx, yy).then(() => {
					chunksLasted--;
					if(chunksLasted === 0) resolve();
				});
				if(i % chunksBreak === 0) {
					console.log("sleeping for 7 secs", chunksLasted, i);
					await sleep(1000 * 7);
				}
			}
		}
	});
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

global.putOnCanvas = function (x1, y1, x2, y2) {
	let canvasWidth = x2 - x1;
	let canvasHeight = y2 - y1;
	
	let canvas = new Canvas.Canvas(canvasWidth, canvasHeight);
	let ctx = canvas.getContext("2d");
	console.log("putting on canvas");
	
	
	x1 = Math.floor(x1/16);
	y1 = Math.floor(y1/16);
	x2 = Math.floor(x2/16);
	y2 = Math.floor(y2/16);
	
	
	for (let canvasX = 0, xx = x1; xx <= x2; xx++, canvasX++) {
		for (let canvasY = 0, yy = y1; yy <= y2; yy++, canvasY++) {
			let chunk = bot.chunkSystem.getChunk(xx, yy);
			if(!chunk) continue;
			let imgData = convertChunkToImageData(chunk, ctx);

			ctx.putImageData(imgData, canvasX*16, canvasY*16);
		}
	}
	return canvas;
}

global.save = async function (canvas) {
	console.log("saving");
	try {
		await writeFile(`./images/${Date.now()}.png`, canvas.toBuffer());
		console.log("done");
	} catch(e) {
		console.error(e);
	}
}


async function takeScreenshot(x1, y1, x2, y2) {
	x1 = x1 < x2 ? x1 : x2;
	y1 = y1 < y2 ? y1 : y2;
	x2 = x1 > x2 ? x1 : x2;
	y2 = y1 > y2 ? y1 : y2;
	await requestArea(x1, y1, x2, y2);
	let canvas = await putOnCanvas(x1, y1, x2, y2);
	
	await save(canvas);
	
}
async function takeScreenshotRadius(radius, x = 0, y = 0) {
	let x1 = x - radius;
	let y1 = y - radius;
	let x2 = x + radius;
	let y2 = y + radius;
	
	await takeScreenshot(x1,y1,x2,y2);
}


bot.on("join", async () => { // to refresh use refresh in console
	setInterval(function() {
		bot.world.move(Math.random() * 10, Math.random() * 10);
	}, 1000 * 10);
	let radius = 128 * 16;
	let start = Date.now();
	await takeScreenshot(-radius, -radius, radius, radius)
	let end = Date.now();
	console.log(end- start);
	//takeScreenshot(Math.pow(2,24)-5, Math.pow(2,24)-5, Math.pow(2,24)-1, Math.pow(2,24)-1);
})

