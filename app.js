$(document).ready(main);

var pdfAPI = PDFJS;

// setup MVC on window

(function(window, pdfAPI){

	function Model(){

		// model props
		this.box = {};
		this.img = new Image();
		this.imgToOCR = new Image();
		this.pdf = {
			currentPage: 1,
			src: '',
			isPDF: false
		};
		this.lang = 'eng';

		// model methods
		Model.prototype.initBox = function(x, y){
			this.box = {
				x: x,
				y: y
			}		
		};
		Model.prototype.sizeBox = function(x, y){
			// get width and length of box
			this.box.mouseX = x;
			this.box.mouseY = y;
			this.box.w = Math.abs(this.box.x - x);
		    this.box.h = Math.abs(this.box.y - y);
		};
		Model.prototype.boxFlip = function(){
			var x = this.box.x,
				y = this.box.y,
				mouseX = this.box.mouseX,
				mouseY = this.box.mouseY,
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
		    this.box.left = left;
		    this.box.top = top;
		};

		Model.prototype.updatePages = function(numPages){
			this.pdf.numPages = numPages;
		}
		Model.prototype.updatePDFsrc = function(aURL){
			this.pdf.src = aURL;
		};
		Model.prototype.updateImgSrc = function(aURL){
			this.img.src = aURL;
		};

	};

	window.ocrSelectApp = window.ocrSelectApp || {};
	window.ocrSelectApp.model = new Model();
})(window, pdfAPI);

(function(window, pdfAPI){

	function View(){

		// view props
		this.imgInput = document.getElementById('img-input');
		this.$buttonPrev = $('#btn-prev');
		this.$buttonNext = $('#btn-next');
		this.$languageOptions = $('select[name=language]');

		this.uploadedImg = document.getElementById('uploaded-img');
		this.$uploadedImg = $('#uploaded-img');
		this.uploadedImg.context = this.uploadedImg.getContext('2d');
		this.dropZone = document.getElementsByClassName('drop-zone')[0];
		this.$dropZone = $('.drop-zone');
		this.testArea = document.getElementById('test-area');
		this.testArea.context = this.testArea.getContext('2d');
		this.$box = $('#box-select');

		// view methods
		View.prototype.setDropZone = function(className){
			this.$dropZone.removeClass();
			this.$dropZone.addClass(className);
		}
		View.prototype.removeBox = function(){
			this.$box.width(0).height(0);
			this.$box.removeClass('box-active');
		};
		View.prototype.renderBox = function(left, top, w, h){
		    this.$box.css({
		    	'left': left,
		        'top': top,
		        'width': w,
		        'height': h
		    });
		    this.$box.addClass('box-active');
		};
		View.prototype.getMousePos = function(event){
			var $uploadedImgParent = this.$uploadedImg.parent();
			var offset = $uploadedImgParent.offset();
			var x = event.pageX - offset.left + $uploadedImgParent.scrollLeft();
			var y = event.pageY - offset.top + $uploadedImgParent.scrollTop();
			return [x, y];
		};
		View.prototype.renderTestArea = function(imageObj, left, top, w, h){	
			// set up testArea canvas dimensions and draw the image
			var left = left,
				top = top,
				clipW = Math.max(1, Math.floor(w)),
				clipH = Math.max(1, Math.floor(h)),
				x = 0,
				y = 0;
			this.testArea.context.clearRect(0, 0, this.testArea.width, this.testArea.height);
			this.testArea.width = clipW;
			this.testArea.height = clipH;
			this.testArea.context.drawImage(imageObj, left, top, clipW, clipH, x, y, clipW, clipH);
		};
		View.prototype.renderUploadedPDF = function(page, scale){
			var viewport = page.getViewport(scale);
			var renderContext = {
			  canvasContext: this.uploadedImg.context,
			  viewport: viewport
			}
			this.uploadedImg.context.clearRect(0, 0, viewport.width, viewport.height);
			this.uploadedImg.width = viewport.width;
			this.uploadedImg.height = viewport.height;

			return page.render(renderContext).promise;
		};
		View.prototype.renderUploadedImg = function(imageObj, w, h){
			this.uploadedImg.context.clearRect(0, 0, w, h);
			this.uploadedImg.width = w;
			this.uploadedImg.height = h;
			this.uploadedImg.context.drawImage(imageObj, 0, 0, w, h);	
		};
		View.prototype.displayProgress = function(event){
			document.getElementById('progress').innerHTML = "Progress: " + Math.floor(100*event.recognized) + "%";
		};
		View.prototype.displayResult = function(textToDisplay) {
			document.getElementById('display').innerHTML += textToDisplay.text + "<br>";
		};
	};

	window.ocrSelectApp = window.ocrSelectApp || {};
	window.ocrSelectApp.view = new View();
})(window, pdfAPI);

(function(window, pdfAPI){

	function Controller(){

		// Controller methods
		Controller.prototype.init = function(model, view){
			var self = this;

			// prevent uploaded image from being draggable
			view.$uploadedImg.on('dragstart', function(event){
				event.preventDefault(); 
			});
			this.initBoxOnMouseDown = this.initBoxOnMouseDown.bind(this);
			this.drawBoxOnMouseMove = this.drawBoxOnMouseMove.bind(this);
			this.captureAreaOnMouseUp = this.captureAreaOnMouseUp.bind(this);

			// init event listeners

			// drag and drop image functionality
			view.dropZone.ondragover = function(event){
				event.preventDefault();
		        event.stopPropagation();
				view.setDropZone('drop-zone');
				return false;
			};
			view.dropZone.ondragend = function(){
				view.setDropZone('');
				return false;
			};
			view.dropZone.ondrop = function(event){
				view.setDropZone('');
				event.preventDefault();
				self.getInputImgPDF.call(self, event.dataTransfer, model, view);
			};

			// next and prev buttons for pdf pages
			view.$buttonPrev.on('click', function(event){
				event.preventDefault();
				if(model.pdf.isPDF && model.pdf.currentPage > 1){
					view.removeBox();
					model.pdf.currentPage -= 1;
					self.getPDFandRender.call(self, pdfAPI, model, view);	
				};
			});
			view.$buttonNext.on('click', function(event){
				event.preventDefault();
				if(model.pdf.isPDF && model.pdf.currentPage < model.pdf.numPages){
					view.removeBox();
					model.pdf.currentPage += 1;	
					self.getPDFandRender.call(self, pdfAPI, model, view);				
				};
			});

			view.$languageOptions.on('change', function(event){
				model.lang = $(this).find('option:selected').val();
			});

			view.imgInput.onchange = function(event){
				view.removeBox();
				self.getInputImgPDF.call(self, this, model, view);
			};
		};

		// get input's file and determine if image or pdf file
		Controller.prototype.getInputImgPDF = function(dataElement, model, view){
			var self = this;
			view.$uploadedImg.off('mousedown', self.initBoxOnMouseDown);

			var fileTypesIMG = ['jpg', 'jpeg', 'png', 'gif'],
				fileTypesPDF = ['pdf'],
				inputExtension = dataElement.files[0].name.split('.').pop().toLowerCase(),
				isPDF = fileTypesPDF.indexOf(inputExtension) > -1,
				isIMG = fileTypesIMG.indexOf(inputExtension) > -1;
			model.pdf.isPDF = isPDF;

			if (isPDF){
				URL.revokeObjectURL(model.pdf.src);
				var tmpPath = URL.createObjectURL(dataElement.files[0]);
				model.updatePDFsrc(tmpPath);
		        model.pdf.currentPage = 1;

		        this.getPDFandRender(pdfAPI, model, view);
			}else if(isIMG){
				var tmpPath = URL.createObjectURL(dataElement.files[0]);
				model.updateImgSrc(tmpPath);
				model.img.onload = function(){
					self.getImgAndRender.call(self, model, view);
				};
			}else{
				console.log('error! invalid file type');
			}
		};
		Controller.prototype.getPDFandRender = function(pdfAPI, model, view){
			var self = this;
			pdfAPI.getDocument(model.pdf.src).then(function(pdf){
				model.updatePages(pdf.numPages);

				pdf.getPage(model.pdf.currentPage).then(function(page){
					var scale = 1;
					view.renderUploadedPDF(page, scale).then(function(){
						var aDataURL = view.uploadedImg.toDataURL("image/jpeg", 1.0);
						model.updateImgSrc(aDataURL);
						model.img.onload = function(){
							view.$uploadedImg.on('mousedown', {arg1: model, arg2: view}, self.initBoxOnMouseDown);
						};
					});
				});
			});
		};
		Controller.prototype.getImgAndRender = function(model, view){
			var self = this;
			view.renderUploadedImg(model.img, model.img.width, model.img.height);
			view.$uploadedImg.on('mousedown', {arg1: model, arg2: view}, self.initBoxOnMouseDown);
			URL.revokeObjectURL(model.img.src);	
		};
		Controller.prototype.initBoxOnMouseDown = function(event){
			var self = this,
				model = event.data.arg1,
				view = event.data.arg2;			

			var xy = view.getMousePos(event);
			view.removeBox();
			model.initBox(xy[0], xy[1]);
			$(document).on('mousemove', {arg1: model, arg2: view}, self.drawBoxOnMouseMove);
			$(document).on("mouseup", {arg1: model, arg2: view}, self.captureAreaOnMouseUp);
		};
		Controller.prototype.drawBoxOnMouseMove = function(event){
			var self = this,
				model = event.data.arg1,
				view = event.data.arg2;
			var xy = view.getMousePos(event);
			model.sizeBox(xy[0], xy[1]);
			model.boxFlip();
			var left = model.box.left,
				top = model.box.top,
				w = model.box.w,
				h = model.box.h;
			view.renderBox(left, top, w, h);
			$(document).on("mouseup", {arg1: model, arg2: view}, self.captureAreaOnMouseUp);
		};
		Controller.prototype.captureAreaOnMouseUp = function(event){
			var self = this,
				model = event.data.arg1,
				view = event.data.arg2;
			$(document).off('mousemove', self.drawBoxOnMouseMove);
			$(document).off('mouseup', self.captureAreaOnMouseUp);

			var left = model.box.left,
				top = model.box.top,
				w = model.box.w,
				h = model.box.h;
			
			view.renderTestArea(model.img, left, top, w, h);

			// prepare testArea.canvas's drawn image for OCR API 
			model.imgToOCR.src = view.testArea.toDataURL("image/jpeg", 1.0);

			// image must load first before running OCR!
			model.imgToOCR.onload = function(){
				self.runOCR(this, Tesseract, model, view);				
			}
		};
		Controller.prototype.runOCR = function(img, ocrAPI, model, view){
			ocrAPI
				.recognize(img, {
					progress: view.displayProgress,
					lang: model.lang
				})
			  	.then(function(textToDisplay){
			  		view.displayResult(textToDisplay);
			  		img.onload = null;
			  	});
		};
	};

	window.ocrSelectApp = window.ocrSelectApp || {};
	window.ocrSelectApp.controller = new Controller();
})(window, pdfAPI);



function main(){

	myModel = window.ocrSelectApp.model;
	myView = window.ocrSelectApp.view;
	myController = window.ocrSelectApp.controller;
	myController.init(myModel, myView);
}
