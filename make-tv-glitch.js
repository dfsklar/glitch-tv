"use strict";

function glitchImage2(_inputImage, _glitchAmount, _brightnessAmount, _frameCount, _iw, _ih) {
	var inputBMD = new BitmapData(_iw, _ih);
	inputBMD.draw(_inputImage);

  var encoder = new GIFEncoder();  // Engine for creating an animated gif
  encoder.setRepeat(0); //0  -> loop forever
  encoder.setDelay(500); //go to next frame every n milliseconds
  encoder.start();
  encoder.setSize(_iw, _ih);
  //for (var i = 0; i<_frameCount; i++) {
  //}
  var bmdFrame = glitchImageSingle(inputBMD, _glitchAmount, _brightnessAmount);
  encoder.addFrame(bmdFrame.data, true);
  encoder.finish();
  return encoder.stream().getData();
}



// Returns instance of outputBMD
function glitchImageSingle(inputBMD, _glitchAmount, _brightnessAmount) {

  console.log("GLITCH IMAGE: ");
  console.log(_glitchAmount);
  console.log(_brightnessAmount);
	
	var start = new Date().getTime();
	
	//draw input image to output canvas
	var outputBMD = new BitmapData(_iw, _ih);
	outputBMD.draw(_inputImage);
	
	var maxOffset = _glitchAmount * _glitchAmount / 100 * _iw;
	
	//randomly offset slices horizontally
	for (var i = 0; i < _glitchAmount * 2; i++) {

		var startY = getRandInt(0, _ih);
		var chunkHeight = getRandInt(1, _ih / 4);
		chunkHeight = Math.min(chunkHeight, _ih - startY);
		var offset = getRandInt(-maxOffset, maxOffset);

		if (offset == 0)
			continue;
		
		if (offset < 0) {
			//shift left
			outputBMD.copyPixels(inputBMD, new Rectangle(-offset, startY, _iw + offset, chunkHeight), new Point(0, startY));
			//wrap around
			outputBMD.copyPixels(inputBMD, new Rectangle(0, startY, -offset, chunkHeight), new Point(_iw + offset,startY));

		} else {
			//shift right
			outputBMD.copyPixels(inputBMD, new Rectangle(0, startY, _iw, chunkHeight), new Point(offset, startY));
			//wrap around
			outputBMD.copyPixels(inputBMD, new Rectangle(_iw - offset, startY, offset, chunkHeight), new Point(0, startY));
		}
	}
	
	//do color offset
	var channel = getRandChannel();
	outputBMD.copyChannel(inputBMD, new Rectangle(0, 0, _iw, _ih), new Point(getRandInt(-_glitchAmount * 2, _glitchAmount * 2), getRandInt(-_glitchAmount * 2, _glitchAmount * 2)), channel, channel);

	//make brighter
	//convert 1 - 10 -> 1 -> 2
	var b = 1 + _brightnessAmount/10*1;
	var brightMat=[
		b, 0, 0, 0, 0,
		0, b, 0, 0, 0,
		0, 0, b, 0, 0,
		0, 0, 0, 1, 0
	];
	
	var zeroPoint = new Point();
	var brightnessFilter = new ColorMatrixFilter(brightMat);
	outputBMD.applyFilter(outputBMD, outputBMD.rect, zeroPoint, brightnessFilter);

	if (false) {
		// Add Scan Lines -- this takes 2 seconds on typical image, this is crazy -- why not use lines instead of rect??
		var line = new Rectangle(0, 0, _iw, 1);
		for (i = 0; i < _ih; i++) {
			if (i % 2 == 0) {
				line.y = i;
				outputBMD.fillRect(line, 0);
			}
		}
	}

  return outputBMD;

	//draw to canvas
	// _context.putImageData(outputBMD.data, 0, 0);

	//log time
	//var end = new Date().getTime();
	///$("#debug").text("Completed in  " + Math.round((end - start)/1000)  + " seconds");
	///$("#overlay").toggle();
};

//handle range input
function setGlitchValue(v) {
	_glitchAmount = v;
}

function setBrightnessValue(v) {
	_brightnessAmount = v;
}

function useScanlines(v) {
	_useScanLines = $("#scanChk").is(':checked');
}

function getRandInt(min, max) {
	return (Math.floor(Math.random() * (max - min) + min));
}

function getRandChannel() {
	var r = Math.random();
	if (r < .33){
		return BitmapDataChannel.GREEN;
	}else if (r < .66){
		return BitmapDataChannel.RED;
	}else{
		return BitmapDataChannel.BLUE;
	}
}
