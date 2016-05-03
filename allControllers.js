(function(){
	'use strict';
	angular
		.module('ocrSelectAngularApp')
		.controller('OcrSelectCtrl', OcrSelectCtrl);


	// manually inject dependencies
	OcrSelectCtrl.$inject = ['$scope', '$timeout', 'imgPDF', 'boxDrawer'];

	function OcrSelectCtrl($scope, $timeout, imgPDF, boxDrawer){
		var vm = this,
			mouseIsDown = false,
			imgPdfModel = {
				img: new Image(),
				pdf: {
					currentPage: 1,
					src: '',
					isPDF: false
				},
				capturedImg: new Image()
			};

		vm.langs = ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'];
		vm.uploadedImg = document.getElementById('uploaded-img');
		vm.$uploadedImg = $('#uploaded-img');
		vm.testArea = document.getElementById('test-area');
		vm.progress = 0 + '%';
		vm.displayResults = '';

		vm.removeBox = removeBox;
		vm.getInputImgPDF = getInputImgPDF;
		vm.uploadFile = uploadFile;
		vm.initBox = initBox;
		vm.drawBox = drawBox;
		vm.captureBox = captureBox;

		function removeBox(){
			vm.isActive = false;
		}
		function getInputImgPDF(){

		}
		function uploadFile(event){
			var files = event.target.files;
			vm.removeBox();
			imgPDF.upload(files[0], imgPdfModel, vm.uploadedImg);
		}
		function initBox(event){
			event.preventDefault(); 
			mouseIsDown = true;
			vm.removeBox();
			boxDrawer.init(event, vm.$uploadedImg);
		}
		function drawBox(event){
			if(mouseIsDown){
				vm.boxSelect = boxDrawer.draw(event, vm.$uploadedImg);
				vm.isActive = boxDrawer.activate();
			}
		}
		function captureBox(event){
			mouseIsDown = false;
			if(vm.isActive){
				var box = boxDrawer.getBox();
				imgPDF.captureOCR(imgPdfModel, box, vm.testArea, vm.langs, displayProgress, displayResults);
				// $scope.$apply(function(){
					// vm.displayResults = results;
				// });
				vm.removeBox();
				// $scope.$apply();
			}
		}
		function displayProgress(progress){
			$timeout(function(){
				vm.progress = progress;
			},0);
		}
		function displayResults(results){
			$timeout(function(){
				console.log('ran displayResults');
				vm.displayResults = results;
			},0);
		}
	}

})();