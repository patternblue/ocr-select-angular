(function(){
	'use strict';

	angular
		.module('ocrSelectAngularApp')
		.factory('PDFJS', pdfApiService)
		.factory('Tesseract', ocrService)
		.factory('imgPDF', imgPDF)
		.factory('boxDrawer', boxDrawer);	

	pdfApiService.$inject = ['$window'];
	ocrService.$inject = ['$window'];

	// pdfAPI service
	function pdfApiService($window){
		if(!$window.PDFJS){
			// If not available, provide a
			// mock service, try to load it from somewhere else,
			// redirect the user to a dedicated error page, ...
		}
		return $window.PDFJS;
	}

	// ocrAPI service
	function ocrService($window){
		if(!$window.Tesseract){
			// If not available, provide a
			// mock service, try to load it from somewhere else,
			// redirect the user to a dedicated error page, ...
		}
		return $window.Tesseract;		
	}

	// imgPDF service
	function imgPDF(){
		var _img = new Image(),
			_pdf = {
				src: '',
				isPDF: false
			},
			_capturedImg = new Image(),
			_renderOptions = [];

		function updateSrc(anObject, yourURL){
			URL.revokeObjectURL(anObject.src);
			anObject.src = yourURL;
		}
		function getRenderOptions(){
			return _renderOptions;
		}
		function getImgSrc(){
			return _img.src;
		}
		function getPdfSrc(){
			return _pdf.src;
		}
		function updateImg(tmpURL){
			updateSrc(_img, tmpURL);
		}
		function updatePdf(tmpURL){
			updateSrc(_pdf, tmpURL);
		}
		function updateCapturedImg(tmpURL){
			updateSrc(_capturedImg, tmpURL);	
		}
		function checkImgOrPdf(file, cbIfImg, cbIfPdf){
			var fileTypesIMG = ['jpg', 'jpeg', 'png', 'gif'],
				fileTypesPDF = ['pdf'],
				inputExtension = file.name.split('.').pop().toLowerCase(),
				isPDF = fileTypesPDF.indexOf(inputExtension) > -1,
				isIMG = fileTypesIMG.indexOf(inputExtension) > -1;
			if (isIMG){
				prepImg(file, cbIfImg);	
			}else if(isPDF){
				prepPdf(file, cbIfPdf);
			}else{
				return undefined;
				console.log('error! invalid file type');
			}
		}
		function prepImg(file, cbIfImg){
			_img.onload = function(event){
				_renderOptions = [
					_img,
					0,
					0,
					_img.width,
					_img.height,
					0,
					0,
					_img.width,
					_img.height
				];				
				cbIfImg();
			}
			updateImg(URL.createObjectURL(file));
		}		

		function prepPdf(file, cbIfPdf){
			updatePdf(URL.createObjectURL(file));
			cbIfPdf();
		}

		function captureImg(box, cbAfterCapture){
			var clipW = Math.max(1, Math.floor(box.w)),
				clipH = Math.max(1, Math.floor(box.h));
			_renderOptions = [
				_img,
				box.left,
				box.top,
				clipW,
				clipH,
				0,
				0,
				clipW,
				clipH
			];	
			cbAfterCapture();
		}
		function prepOCR(tmpURL, cbRunOCR){
			_capturedImg.onload = function(){
				cbRunOCR(this);				
			}
			updateCapturedImg(tmpURL);
		}
		
		// expose imgPDF service here
		var service = {
			getRenderOptions: getRenderOptions,
			getImgSrc: getImgSrc,
			getPdfSrc: getPdfSrc,
			updateImg: updateImg,
			updatePdf: updatePdf,
			updateCapturedImg: updateCapturedImg,
			checkImgOrPdf: checkImgOrPdf,
			prepImg: prepImg,
			prepPdf: prepPdf,
			captureImg: captureImg,
			prepOCR: prepOCR
		};
		return service;
	}

	// boxDrawer service
	function boxDrawer(){
		var box = {};
		function init(xy){
			box = {
				x: xy[0],
				y: xy[1]
			};
		}

		function getSize(box, xy){
			box.mouseX = xy[0];
			box.mouseY = xy[1];
			box.w = Math.abs(box.x - xy[0]);
			box.h = Math.abs(box.y - xy[1]);
		}

		function boxFlip(box){
			var x = box.x,
				y = box.y,
				mouseX = box.mouseX,
				mouseY = box.mouseY,
				left = 0,
				top = 0;
		    if(mouseX <= x && mouseY >= y){
		    	// lower-left quad of init point
		    	left = mouseX;
		    	top = y;
		    } else if (mouseY <= y && mouseX >= x) {
		    	// upper-right quad of init point
		    	left = x;
		    	top = mouseY;
		    } else if (mouseY < y && mouseX < x) {
		    	// upper-left quad of init point
		    	left = mouseX;
		    	top = mouseY;
		    } else{
		    	// lower-right quad of init point
		    	left = x;
		    	top = y;
		    }
		    box.left = left;
		    box.top = top;
		};

		function draw(xy){
			getSize(box, xy);
			boxFlip(box);
			var left = box.left,
				top = box.top,
				w = box.w,
				h = box.h;
		    return {
		    	'left': left,
		        'top': top,
		        'width': w,
		        'height': h
		    };
		}
		function getBox(){
			return box;
		}

		// expose boxDrawer service
		var service = {
			init: init,
			draw: draw,
			getBox: getBox
		};
		return service;
	}

})();