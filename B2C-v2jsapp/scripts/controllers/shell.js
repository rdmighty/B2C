(function () {
    var app = angular.module('app')
    .controller('shell', ['$scope', '$rootScope', 'appAuth', '$state', function ($scope, $rootScope, appAuth, $state) {
        var vm = this;
        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            /**
             ** * If current state is not login and app is not authenticated then redirect to login
             ** * If current state is login and app is authenticated then redirect to home
             **/
            if (toState.name != 'login' && !appAuth.isAuthenticated){                
                $state.go('login');
                event.preventDefault();                
            } else if (toState.name == 'login' && appAuth.isAuthenticated) {
                $state.go('home');
                event.preventDefault();
            }
        });
    }])
})();