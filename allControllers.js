(function(){
	'use strict';
	angular
		.module('allControllers', [])
		.controller('OcrSelectCtrl', OcrSelectCtrl);

	// manually inject dependencies
	OcrSelectCtrl.$inject = ['$http'];

	function OcrSelectCtrl($http){
		var vm = this;
		
		vm.lang = 'eng';
		vm.items = ['dan', 'deu', 'eng', 'spa', 'fra', 'hin', 'ita', 'jpn', 'kor', 'lit', 'meme', 'por', 'rus', 'swe', 'tur'];
	}
})();