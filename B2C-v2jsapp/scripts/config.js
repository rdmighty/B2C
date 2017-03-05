(function () {
    var app = angular.module('app')
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');

        //applicaionID created in AD B2C portal
        var applicationId = 'c1c75418-0081-4942-ae69-ef97a4434819';
        var scope = 'openid ' + applicationId;
        var responseType = 'token id_token';
        var redirectURI = '../redirect.html';

        //API url for task service
        var apiBaseURL = 'https://localhost:44332/';
        var apiTasksURL = apiBaseURL + '/api/Tasks';;

        //update the policy names with the exact name from the AD B2C policies blade
        var policies = {
            signInPolicy: "B2C_1_CS_SignIn",
            editProfilePolicy: "B2C_1_SC_PEdit",
            signInSignUpPolicy: "B2C_1_CS_SignUpIn"
        };

        //initiate all policies
        hello.init({
            adB2CSignIn: applicationId,
            adB2CSignInSignUp: applicationId,
            adB2CEditProfile: applicationId
        }, {
            redirect_uri: '../redirect.html',
            scope: 'openid ' + applicationId,
            response_type: 'token id_token'
        });

        $stateProvider

        .state('home', {
            url: '/home',
            templateUrl: 'views/home.html'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'views/login.html'
        })

        .state('about', {
            url: '/about',
            templateUrl: 'views/about.html'
        });
    }])
})();