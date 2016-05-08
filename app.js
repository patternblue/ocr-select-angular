(function(){
	'use strict';

	angular
		.module('ocrSelectAngularApp', [
			'ngRoute'
			// 'ngFileUpload'
		])
		.directive('ondragover', onDragOver)
		.directive('onFileChange', onFileChange)
		.directive('onDragEnd', onDragEnd)
		.directive('onDrop', onDrop);

	// custom onChange listener for image upload changes in input field
	function onFileChange() {
		return {
			// use as attribute
			restrict: 'A',

			link: function (scope, element, attrs) {
				var handler = scope.$eval(attrs.onFileChange);
				element.bind('change', handler);
			}
		};
	};

	// need to work on these
	function onDragOver() {
		return {
			// use as attribute
			restrict: 'A',

			link: function (scope, element, attrs) {
				var handler = scope.$eval(attrs.onDragOver);
				element.bind('dragover', handler);
			}
		};
	};
	function onDragEnd() {
		return {
			// use as attribute
			restrict: 'A',

			link: function (scope, element, attrs) {
				var handler = scope.$eval(attrs.onDragEnd);
				element.bind('dragend', handler);
			}
		};
	};
	function onDrop() {
		return {
			// use as attribute
			restrict: 'A',

			link: function (scope, element, attrs) {
				var handler = scope.$eval(attrs.onDrop);
				element.bind('drop', handler);
			}
		};
	};





})();

