(function () {
    var app = angular.module('app')
    .factory('appAuth', ['$rootScope', function ($rootScope) {
        var loginDisplayType = {
            PopUp: 'popup',
            None: 'none',
            Page: 'page' //default is popup, if we use page option, webpage gets redirected to b2c login page then to redirect html.
        };

        var helloNetwork = {
            adB2CSignIn: 'adB2CSignIn',
            adB2CSignInSignUp: 'adB2CSignInSignUp',
            adB2CEditProfile: 'adB2CEditProfile'
        };
 
        function logout() {
            hello.logout(this.authNetwork, { force: true }).then(function (auth) {
                //perhaps this is not called; don't rely on it
                this.isAuthenticated = fale;
                $state.go('login');                
            }, function (e) {
                bootbox.alert('Logout error: ' + e.error.message);
            });
        }

        return {
            loginDisplayType: JSON.parse(JSON.stringify(loginDisplayType)),
            helloNetwork: JSON.parse(JSON.stringify(helloNetwork)),
            authNetwork: null,
            logout: logout,
            isAuthenticated: false            
        }
    }])
})();