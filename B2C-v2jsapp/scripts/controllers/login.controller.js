(function () {
    var app = angular.module('app')

        .controller('loginCtrl', ['$scope', '$rootScope', 'appAuth', '$state', function ($scope, $rootScope, appAuth, $state) {
        var vm = this;

        var loginDisplayType = appAuth.loginDisplayType;
        var helloNetwork = appAuth.helloNetwork;

        function bindFunction(fn) {
            if (fn instanceof Function) {
                return fn.bind(vm); //bind it to the controllerAs
            }
            return null;            
        }

        //functions
        vm.signInLoginPolicy = bindFunction(signInLoginPolicy);
        vm.signInSignUpPolicy = bindFunction(signInSignUpPolicy);

        //definitions
        function signInSignUpPolicy() {
            policyLogin(helloNetwork.adB2CSignInSignUp, loginDisplayType.Page);
        }

        function signInLoginPolicy() {
            policyLogin(helloNetwork.adB2CSignIn, loginDisplayType.Page);
        }

        function safeApply() {
            if (!$scope.$$phase)
                $scope.$apply();
        }

        function authenticateTheApp(auth) {
            if (!appAuth.isAuthenticated) {
                appAuth.isAuthenticated = true;
                auth.authNetwork = auth.network;
                $state.go('home');
                safeApply();
            }           
        }

        hello.on('auth.login', function (auth) {
            console.log("signed in or silently renewed the token with Azure AD B2C");
            log(auth);
            
            authenticateTheApp(auth);
        });

        function online(session) {
            var currentTime = (new Date()).getTime() / 1000;
            return session && session.access_token && session.expires > currentTime;
        };

        function policyLogin(network, displayType) {

            if (!displayType) {
                displayType = 'page';
            }

            var b2cSession = hello(network).getAuthResponse();

            //in case of silent renew, check if the session is still active otherwise ask the user to login again
            if (!online(b2cSession) && displayType === loginDisplayType.None) {
                bootbox.alert('Session expired... please login again', function () {
                    policyLogin(network, loginDisplayType.Page);
                });
                return;
            }

            hello(network).login({ display: displayType }, log).then(function (auth) {                
            }, function (e) {
                appAuth.isAuthenticated = false;
                if ('Iframe was blocked' in e.error.message) {
                    policyLogin(network, loginDisplayType.Page);
                    return;
                }
                bootbox.alert('Signin error: ' + e.error.message);
            });
        }

        function policyLogout(network, policy) {

            hello.logout(network, { force: true }).then(function (auth) {
                $state.go('login');
                bootbox.alert('policy: ' + policy + ' You are logging out from AD B2C');
            }, function (e) {
                bootbox.alert('Logout error: ' + e.error.message);
            });
        }

        (function (hello) {

            // Monitor for a change in state and fire
            var oldSessions = {};

            // Hash of expired tokens
            var expired = {};

            // Listen to other triggers to Auth events, use these to update this
            hello.on('auth.login, auth.logout', function (auth) {
                if (auth && typeof (auth) === 'object' && auth.network) {
                    appAuth.authNetwork = auth.network;
                    oldSessions[auth.network] = hello.utils.store(auth.network) || {};
                    safeApply();
                }
            });

            (function self() {

                var CURRENT_TIME = ((new Date()).getTime() / 1e3);
                var emit = function (eventName) {
                    hello.emit('auth.' + eventName, {
                        network: name,
                        authResponse: session
                    });
                };

                // Loop through the services
                for (var name in hello.services) {
                    if (hello.services.hasOwnProperty(name)) {

                        if (!hello.services[name].id) {
                            // We haven't attached an ID so dont listen.
                            continue;
                        }

                        // Get session
                        var session = hello.utils.store(name) || {};
                        var provider = hello.services[name];
                        var oldSess = oldSessions[name] || {};

                        // Listen for globalEvents that did not get triggered from the child
                        if (session && 'callback' in session) {

                            // To do remove from session object...
                            var cb = session.callback;
                            try {
                                delete session.callback;
                            }
                            catch (e) { }

                            // Update store
                            // Removing the callback
                            hello.utils.store(name, session);

                            // Emit global events
                            try {
                                window[cb](session);
                            }
                            catch (e) { }
                        }

                        // Refresh token
                        if (session && ('expires' in session) && session.expires < CURRENT_TIME) {

                            if (!auth.isAuthenticated) {
                                auth.isAuthenticated = true;
                                $state.go('home');
                                if (!$scope.$$phase)
                                    $scope.$apply();
                            }

                            // If auto refresh is possible
                            // Either the browser supports
                            var refresh = provider.refresh || session.refresh_token;

                            // Has the refresh been run recently?
                            if (refresh && (!(name in expired) || expired[name] < CURRENT_TIME)) {
                                // Try to resignin
                                hello.emit('notice', name + ' has expired trying to resignin');
                                hello.login(name, { display: 'none', force: false });

                                // Update expired, every 10 minutes
                                expired[name] = CURRENT_TIME + 600;
                            }

                                // Does this provider not support refresh
                            else if (!refresh && !(name in expired)) {
                                // Label the event
                                emit('expired');
                                expired[name] = true;
                            }

                            // If session has expired then we dont want to store its value until it can be established that its been updated
                            continue;
                        }

                            // Has session changed?
                        else if (oldSess.access_token === session.access_token &&
                        oldSess.expires === session.expires) {
                            continue;
                        }

                            // Access_token has been removed
                        else if (!session.access_token && oldSess.access_token) {
                            emit('logout');
                        }

                            // Access_token has been created
                        else if (session.access_token && !oldSess.access_token) {
                            emit('login');
                        }

                            // Access_token has been updated
                        else if (session.expires !== oldSess.expires) {
                            emit('update');
                        }

                        // Updated stored session
                        oldSessions[name] = session;

                        // Remove the expired flags
                        if (name in expired) {
                            delete expired[name];
                        }
                    }
                }

                // Check error events
                setTimeout(self, 1000);
            })();

        })(hello);
    }]);
})();