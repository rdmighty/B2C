(function () {
    var app = angular.module('app')
    .controller('homeController', ['$scope', '$rootScope', 'appAuth', function ($scope, $rootScope, appAuth) {
        var vm = this;

        vm.logout = logout;

        function logout() {
            appAuth.logout();
        }

    }]);
})();