(function(){
	'use strict';
	angular
		.module('ocrSelectAngularApp')
		.controller('OcrSelectCtrl', OcrSelectCtrl);


	// manually inject dependencies
	OcrSelectCtrl.$inject = ['$scope', 'imgPDF'];

	function OcrSelectCtrl($scope, imgPDF){
		var vm = this;
		vm.img = new Image();
		vm.lang = 'eng';
		vm.items = ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'];
		vm.removeBox = function(){
		}

		vm.getInputImgPDF = function(){
			console.log('getInputImgPDF ran');

		}
		vm.uploadFile = function(event){
			var files = event.target.files;
			vm.removeBox();
			vm.img.onload = function(event){
				console.log('ran load');
				imgPDF.render(vm.img);
			}

			vm.img.src = imgPDF.getSRC(files[0]);
		};
	}

})();