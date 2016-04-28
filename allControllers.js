(function(){
	'use strict';
	angular
		.module('ocrSelectAngularApp')
		// .controller('OcrSelectCtrl', OcrSelectCtrl);
		.controller('OcrSelectCtrl', function(){
			var vm = this;
			console.log(vm);
			// console.log($scope);
			vm.lang = 'eng';
			vm.items = ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'];
			vm.removeBox = function(){
				console.log('removeBox ran');
			}
			vm.getInputImgPDF = function(){
				console.log('getInputImgPDF ran');
			}
			vm.uploadFile = function(event){
				console.log('uploadFile ran');
				var files = event.target.files;
				vm.removeBox();
				vm.getInputImgPDF();
			};
		});
	// manually inject dependencies
	// OcrSelectCtrl.$inject = ['$scope'];

	// function OcrSelectCtrl(){
	// 	var vm = this;
	// 	console.log(vm);
	// 	// console.log($scope);
	// 	vm.lang = 'eng';
	// 	vm.items = ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'];
	// 	vm.removeBox = function(){
	// 		console.log('removeBox ran');
	// 	}
	// 	vm.getInputImgPDF = function(){
	// 		console.log('getInputImgPDF ran');
	// 	}
	// 	vm.uploadFile = function(event){
	// 		var files = event.target.files;
	// 		vm.removeBox();
	// 		vm.getInputImgPDF();
	// 	};
	// }

})();