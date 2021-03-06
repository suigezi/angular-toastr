(function() {
  'use strict';

  angular.module('toastr')
    .directive('toast', toast);

  toast.$inject = ['$injector', '$interval', 'toastrConfig', 'toastr'];

  function toast($injector, $interval, toastrConfig, toastr) {
    return {
      replace: true,
      templateUrl: function() {
        return toastrConfig.templates.toast;
      },
      controller: 'ToastController',
      link: toastLinkFunction
    };

    function toastLinkFunction(scope, element, attrs, toastCtrl) {
      var timeout;

      scope.toastClass = scope.options.toastClass;
      scope.titleClass = scope.options.titleClass;
      scope.messageClass = scope.options.messageClass;
      scope.progressBar = scope.options.progressBar;
      scope.showBtnYesNo = scope.options.showBtnYesNo;
      scope.btnYesText = scope.options.btnYesText;
      scope.btnNoText = scope.options.btnNoText;
      scope.timeOutFunction = scope.options.timeOutFunction;
      console.log(scope.options.timeOutFunction);

      if (wantsCloseButton()) {
        var button = angular.element(scope.options.closeHtml),
          $compile = $injector.get('$compile');
        button.addClass('toast-close-button');
        button.attr('ng-click', 'close()');
        $compile(button)(scope);
        element.prepend(button);
      }

      scope.init = function() {
        if (scope.options.timeOut) {
          timeout = createTimeout(scope.options.timeOut);
        }
        if (scope.options.onShown) {
          scope.options.onShown();
        }
      };

      element.on('mouseenter', function() {
        hideAndStopProgressBar();
        if (timeout) {
          $interval.cancel(timeout);
        }
      });

      scope.tapToast = function () {
        if (scope.options.tapToDismiss) {
          scope.close(true);
        }else{
          if(typeof scope.options.onClick === 'function'){
              scope.options.onClick();
            }
        }
      };

      scope.btnYesClick = function ($event) {
        if (angular.isFunction(scope.options.btnYesClick)) {
            scope.options.btnYesClick();
            $event.stopPropagation();
            toastr.remove(scope.toastId, true);
        }
      }

      scope.btnNoClick = function ($event) {
        if (angular.isFunction(scope.options.btnNoClick)) {
          scope.options.btnNoClick();
          $event.stopPropagation();
          toastr.remove(scope.toastId, true);
        }
      }

      scope.close = function (wasClicked) {
        toastr.remove(scope.toastId, wasClicked);
      };

      element.on('mouseleave', function() {
        if (scope.options.timeOut === 0 && scope.options.extendedTimeOut === 0) { return; }
        scope.$apply(function() {
          scope.progressBar = scope.options.progressBar;
        });
        timeout = createTimeout(scope.options.extendedTimeOut);
      });

      function createTimeout(time) {
        toastCtrl.startProgressBar(time);
        return $interval(function() {
          toastCtrl.stopProgressBar();
          toastr.remove(scope.toastId);
          if (typeof scope.timeOutFunction === 'function') {
            scope.timeOutFunction();
          }
        }, time, 1);
      }

      function hideAndStopProgressBar() {
        scope.progressBar = false;
        toastCtrl.stopProgressBar();
      }

      function wantsCloseButton() {
        return scope.options.closeHtml;
      }
    }
  }
}());
