(function(){
	'use strict';

	angular
		.module('ocrSelectAngularApp')
		.controller('OcrSelectCtrl', OcrSelectCtrl);

	// manually inject dependencies
	OcrSelectCtrl.$inject = ['$scope', '$timeout', 'imgPDF', 'boxDrawer', 'PDFJS', 'Tesseract'];

	function OcrSelectCtrl($scope, $timeout, imgPDF, boxDrawer, PDFJS, Tesseract){
		var vm = this;

		// scope variables
		vm.mouseIsDown = false;
		vm.dropZone = '';
		vm.uploadedCanvas = document.getElementById('uploaded-img');
		vm.$uploadedCanvas = $('#uploaded-img');
		vm.pdf = {
			numPages: 1,
			pageList: [1],
			currentPage: 1
		};
		vm.capturedCanvas = document.getElementById('test-area');

		vm.langs = {
			list: ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'],
			selectedLang: 'eng'
		};

		vm.progress = 0 + '%';
		vm.displayResults = '';

		// scope methods
		vm.removeBox = removeBox;
		vm.fileChangeHandler = fileChangeHandler;
		vm.dragOverHandler = dragOverHandler;
		vm.dragEndHandler = dragEndHandler;
		vm.dropHandler = dropHandler;
		vm.onPageSelect = onPageSelect;
		vm.initBox = initBox;
		vm.drawBox = drawBox;
		vm.captureBox = captureBox;

		function fileChangeHandler(event){
			var file = event.target.files[0];
			vm.removeBox();
			imgPDF.checkImgOrPdf(file, uploadImg, uploadPdf);
		}
		function onPageSelect(event){			
			updatePdfCurrentPage(event);
			uploadPdf();
		}
		function dragOverHandler(event){
			console.log('dragOverHandler');
			event.preventDefault();
	        event.stopPropagation();
			setDropZone('drop-zone');
			return false;
		}
		function dragEndHandler(event){
			console.log('dragEndHandler');
			setDropZone('');
			return false;
		}
		function dropHandler(event){
			console.log('dropHandler');
			setDropZone('');
			event.preventDefault();
			var file = event.dataTransfer;
			imgPDF.checkImgOrPdf(file, uploadImg, uploadPdf);
		}

		function setDropZone(className){
			vm.dropZone = className;
		}



		function uploadImg(){
			var options = imgPDF.getRenderOptions();
			renderIMG(vm.uploadedCanvas, options);
		}

		function renderIMG(canvas, options){
			var context = canvas.getContext('2d');
			var dx = options[5],
				dy = options[6],
				dw = options[7],
				dh = options[8];
			context.clearRect(dx, dy, dw, dh);
			canvas.width = dw;
			canvas.height = dh;
			context.drawImage.apply(context, options);
		}

		function uploadPdf(){
	        var src = imgPDF.getPdfSrc();

			PDFJS.getDocument(src)
				.then(function(pdf){
					// update pdf number of pages if different
					if(pdf.numPages !== vm.pdf.numPages){
						updatePdfPages(pdf.numPages);
					}
					// get pdf page	
					pdf.getPage(vm.pdf.currentPage)
						.then(function(page){
							renderPdf(vm.uploadedCanvas, page)
								.then(function(){
									// update img model's source with uploadedCanvas's aDataURL
									var tmpURL = vm.uploadedCanvas.toDataURL("image/jpeg", 1.0);
									imgPDF.updateImg(tmpURL);
								});
						});
				});
		}
		function updatePdfPages(numPages){
			$timeout(function(){
				vm.pdf.numPages = numPages;

				// set pdf vm's pageList array
				vm.pdf.pageList = [];
				for(var i = 1; i <= numPages; i++){
					vm.pdf.pageList.push(i);
				}	
			},0);
		}
		function updatePdfCurrentPage(pageNum){
			$timeout(function(){
				vm.pdf.currentPage = pageNum;
			}, 0);
		}
		function renderPdf(viewEl, page){
			var scale = 1,
				viewport = page.getViewport(scale),
				context = viewEl.getContext('2d'),
				renderContext = {
			  		canvasContext: context,
			  		viewport: viewport
				};
			context.clearRect(0, 0, viewport.width, viewport.height);
			viewEl.width = viewport.width;
			viewEl.height = viewport.height;
			return page.render(renderContext).promise;
		}

		function removeBox(){
			vm.isActive = false;
		}
		function getMousePos(event, $canvas){
			var x = event.pageX - $canvas.parent().offset().left + $canvas.parent().scrollLeft(),
				y = event.pageY - $canvas.parent().offset().top + $canvas.parent().scrollTop();
			return [x, y];
		}
		function initBox(event){
			event.preventDefault(); 
			vm.mouseIsDown = true;
			vm.removeBox();
			var xy = getMousePos(event, vm.$uploadedCanvas);
			boxDrawer.init(xy);
		}
		function drawBox(event){
			if(vm.mouseIsDown){
				var xy = getMousePos(event, vm.$uploadedCanvas);
				vm.boxSelect = boxDrawer.draw(xy);
				vm.isActive = 'box-active';
			}
		}
		function captureBox(event){
			vm.mouseIsDown = false;
			if(vm.isActive){
				var box = boxDrawer.getBox();
				imgPDF.captureImg(box, renderCapturedImg);
				vm.removeBox();
			}
		}
		function renderCapturedImg(){
			var options = imgPDF.getRenderOptions();
			renderIMG(vm.capturedCanvas, options);
			var tmpURL = vm.capturedCanvas.toDataURL("image/jpeg", 1.0);
			imgPDF.prepOCR(tmpURL, runOCR);
		}
		function runOCR(imgObj){
			Tesseract
				.recognize(imgObj, {
					progress: displayProgress,
					lang: vm.langs.selectedLang
				})
			  	.then(function(textToDisplay){
			  		displayResults(textToDisplay.text);
			  		imgObj.onload = null;
			  		URL.revokeObjectURL(imgObj.src);
			  		console.log(this);
			  	});
		}
		function displayProgress(progress){
			$timeout(function(){
				if(progress.recognized >= 0){
					vm.progress = 'Progress: ' + Math.floor(100*progress.recognized) + '%';
				}else{
					vm.progress = 'Progress: ...';
				}
			},0);
		}
		function displayResults(results){
			$timeout(function(){
				vm.displayResults = results;
			},0);
		}
	}

})();