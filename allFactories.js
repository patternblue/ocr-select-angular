(function(){
	'use strict';

	angular
		.module('ocrSelectAngularApp')
		.factory('imgPDF', imgPDF)
		.factory('boxDrawer', boxDrawer);	

	// imgPDF.$inject = ['$scope'];

	

	function imgPDF(){
		function upload(file, model, view){
			var fileTypesIMG = ['jpg', 'jpeg', 'png', 'gif'],
				fileTypesPDF = ['pdf'],
				inputExtension = file.name.split('.').pop().toLowerCase(),
				isPDF = fileTypesPDF.indexOf(inputExtension) > -1,
				isIMG = fileTypesIMG.indexOf(inputExtension) > -1;
			if (isIMG){
				URL.revokeObjectURL(model.img.src);
				model.img.onload = function(event){
					var options = {
						img: model.img,
						sx: 0,
						sy: 0,
						sw: model.img.width,
						sh: model.img.height,
						dx: 0,
						dy: 0,
						dw: model.img.width,
						dh: model.img.height
					}
					renderIMG(options, view);
				}
				updateSrc(model.img, URL.createObjectURL(file)); 	

			}else if(isPDF){
				URL.revokeObjectURL(model.pdf.src);
				updateSrc(model.pdf, URL.createObjectURL(file));

		        model.pdf.currentPage = 1;
		        getAndRenderPDF(PDFJS, model, view);
			}else{
				return undefined;
				console.log('error! invalid file type');
			}
		}
		function updateSrc(imgOrPdf, yourURL){
			imgOrPdf.src = yourURL;
		}
		function renderIMG(options, canvas){
			var context = canvas.getContext('2d');
			var img = options.img,
				sx = options.sx,
				sy = options.sy,
				sw = options.sw,
				sh = options.sh,
				dx = options.dx,
				dy = options.dy,
				dw = options.dw,
				dh = options.dh;
			context.clearRect(dx, dy, dw, dh);
			canvas.width = dw;
			canvas.height = dh;
			context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
		}

		function captureOCR(model, box, testArea, progress, results, langs){
			var clipW = Math.max(1, Math.floor(box.w)),
				clipH = Math.max(1, Math.floor(box.h)),
				options = {
					img: model.img,
					sx: box.left,
					sy: box.top,
					sw: clipW,
					sh: clipH,
					dx: 0,
					dy: 0,
					dw: clipW,
					dh: clipH
				};
			renderIMG(options, testArea);


			// prepare testArea canvas's drawn image for OCR API 
			model.capturedImg.src = testArea.toDataURL("image/jpeg", 1.0);

			// image must load first before running OCR!
			model.capturedImg.onload = function(){
				runOCR(this, Tesseract, progress, results, langs);				
			}
		}

		function runOCR(img, ocrAPI, progress, results, langs){
			ocrAPI
				.recognize(img, {
					progress: progress,
					lang: langs[3]
				})
			  	.then(function(textToDisplay){
			  		results = textToDisplay.text;
			  		img.onload = null;
			  	});
		}

		function getAndRenderPDF(pdfAPI, model, view){
			var self = this;
			pdfAPI.getDocument(model.pdf.src).then(function(pdf){
				model.pdf.numPages = pdf.numPages;

				pdf.getPage(model.pdf.currentPage).then(function(page){
					var scale = 1;
					renderPDF(view, page, scale).then(function(){
						var aDataURL = view.toDataURL("image/jpeg", 1.0);
						updateSrc(model.img, aDataURL);

						// model.img.onload = function(){
						// 	view.$uploadedImg.on('mousedown', {arg1: model, arg2: view}, self.initBoxOnMouseDown);
						// };

						// set mousedown listener for drawbox here
					});
				});
			});
		}

		function renderPDF(view, page, scale){
			var viewport = page.getViewport(scale);
			var context = view.getContext('2d');
			var renderContext = {
			  canvasContext: context,
			  viewport: viewport
			}
			context.clearRect(0, 0, viewport.width, viewport.height);
			view.width = viewport.width;
			view.height = viewport.height;
			return page.render(renderContext).promise;
		}

		var service = {
			upload: upload,
			captureOCR: captureOCR
		};
		return service;
	}

	function boxDrawer(){
		var box = {};
		function init(event, canvas){
			var xy = getMousePos(event, canvas);
			box = {
				x: xy[0],
				y: xy[1]
			};
		}
		function getMousePos(event, $canvas){
			var x = event.pageX - $canvas.parent().offset().left + $canvas.parent().scrollLeft(),
				y = event.pageY - $canvas.parent().offset().top + $canvas.parent().scrollTop();
			console.log(x);
			return [x, y];
		};

		function sizeBox(event, box, $canvas){

			var xy = getMousePos(event, $canvas);
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


		function draw(event, $canvas){
			sizeBox(event, box, $canvas);
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
		function activate(){
		    return 'box-active';
		};
		function getBox(){
			return box;
		}


		var service = {
			init: init,
			draw: draw,
			activate: activate,
			getBox: getBox
		};
		return service;
	}

})();