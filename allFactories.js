(function(){
	'use strict';

	angular
		.module('ocrSelectAngularApp')
		.factory('imgPDF', imgPDF);	

	// imgPDF.$inject = ['$scope'];

	

	function imgPDF(){
		function getSRC(file){
			var fileTypesIMG = ['jpg', 'jpeg', 'png', 'gif'],
				fileTypesPDF = ['pdf'],
				inputExtension = file.name.split('.').pop().toLowerCase(),
				isPDF = fileTypesPDF.indexOf(inputExtension) > -1,
				isIMG = fileTypesIMG.indexOf(inputExtension) > -1;
			if (isPDF){
				URL.revokeObjectURL(model.pdf.src);
				var tmpPath = URL.createObjectURL(file);
			}else if(isIMG){
				console.log('ran isIMG');
				var tmpPath = URL.createObjectURL(file);
				return tmpPath;	
			}else{
				return undefined;
				console.log('error! invalid file type');
			}
		}

		function render(img){
			var canvas = document.getElementById('uploaded-img');
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, img.width, img.height);
			canvas.width = img.width;
			canvas.height = img.height;
			context.drawImage(img, 0, 0, img.width, img.height);
		}

		var service = {
			getSRC: getSRC,
			render: render
		};

		return service;


	}



})();