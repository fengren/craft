// Generated by CoffeeScript 1.7.1
(function() {
  var mainApp;

  mainApp = angular.module("MainApp", ['ngRoute', 'ngCookies', 'ngAnimate', 'appConfigSrvc', 'appPrefSrvc', 'appDataSrvc', 'appStoreSrvc', 'appUtilSrvc', 'appFltr', 'appDrtv', 'saltApiSrvc', 'demoSrvc', 'errorReportingSrvc', 'highstateCheckSrvc', 'eventSrvc', 'jobSrvc', 'saltSrvc', 'fetchActivesSrvc']);

  mainApp.constant('MainConstants', {
    name: 'Halite',
    owner: 'SaltStack'
  });

  mainApp.config([
    "Configuration", "MainConstants", "$locationProvider", "$routeProvider", "$httpProvider", function(Configuration, MainConstants, $locationProvider, $routeProvider, $httpProvider) {
      var base, item, name, view, _i, _len, _ref;
      $locationProvider.html5Mode(true);
      base = Configuration.baseUrl;
      _ref = Configuration.views;
      for (name in _ref) {
        item = _ref[name];
        if (item.label != null) {
          $routeProvider.when(item.route, {
            templateUrl: item.template,
            controller: item.controller
          });
        } else {
          for (_i = 0, _len = item.length; _i < _len; _i++) {
            view = item[_i];
            $routeProvider.when(view.route, {
              templateUrl: view.template,
              controller: view.controller
            });
          }
        }
      }
      $routeProvider.otherwise({
        redirectTo: Configuration.views.otherwise.route
      });
      return true;
    }
  ]);

  mainApp.controller('NavbarCtlr', [
    '$scope', '$rootScope', '$location', '$route', '$routeParams', 'Configuration', 'AppPref', 'AppData', 'LocalStore', 'SessionStore', 'SaltApiSrvc', function($scope, $rootScope, $location, $route, $routeParams, Configuration, AppPref, AppData, LocalStore, SessionStore, SaltApiSrvc) {
      var _ref;
      $scope.location = $location;
      $scope.route = $route;
      $scope.winLoc = window.location;
      $scope.baseUrl = Configuration.baseUrl;
      $scope.debug = AppPref.get('debug');
      $scope.errorMsg = '';
      $scope.isCollapsed = true;
      $scope.loggedIn = SessionStore.get('loggedIn') != null ? SessionStore.get('loggedIn') : false;
      $scope.username = (_ref = SessionStore.get('saltApiAuth')) != null ? _ref.user : void 0;
      $scope.views = Configuration.views;
      $scope.navery = {
        'navs': {},
        'activate': function(navact) {
          var label, nav, _ref1;
          navact.state = 'active';
          _ref1 = this.navs;
          for (label in _ref1) {
            nav = _ref1[label];
            if (nav !== navact) {
              nav.state = 'inactive';
            }
          }
          return true;
        },
        'update': function(newPath, oldPath) {
          var label, nav, _ref1;
          _ref1 = this.navs;
          for (label in _ref1) {
            nav = _ref1[label];
            if (newPath.match(nav.matcher) != null) {
              this.activate(nav);
              return true;
            }
          }
          return true;
        },
        'load': function(views) {
          var item, name, view, _results;
          _results = [];
          for (name in views) {
            item = views[name];
            if (item.label != null) {
              _results.push(this.navs[item.label] = {
                state: 'inactive',
                matcher: item.matcher
              });
            } else {
              _results.push((function() {
                var _i, _len, _results1;
                _results1 = [];
                for (_i = 0, _len = item.length; _i < _len; _i++) {
                  view = item[_i];
                  _results1.push(this.navs[view.label] = {
                    state: 'inactive',
                    matcher: view.matcher
                  });
                }
                return _results1;
              }).call(this));
            }
          }
          return _results;
        }
      };
      $scope.navery.load($scope.views);
      $scope.$watch('location.path()', function(newPath, oldPath) {
        $scope.navery.update(newPath, oldPath);
        return true;
      });
      $scope.login = {
        username: "",
        password: ""
      };
      $scope.logoutUser = function() {
        $scope.errorMsg = "";
        $scope.username = null;
        $scope.loggedIn = false;
        $scope.login = {
          username: "",
          password: ""
        };
        $scope.saltApiLogoutPromise = SaltApiSrvc.logout($scope);
        $scope.saltApiLogoutPromise.success(function(data, status, headers, config) {
          var _ref1;
          if ((data != null ? (_ref1 = data["return"]) != null ? _ref1[0] : void 0 : void 0) != null) {
            SessionStore.set('loggedIn', $scope.loggedIn);
            SessionStore.remove('saltApiAuth');
            $rootScope.$broadcast('ToggleAuth', $scope.loggedIn);
          }
          return true;
        });
        return true;
      };
      $scope.loginUser = function() {
        $scope.errorMsg = "";
        $scope.saltApiLoginPromise = SaltApiSrvc.login($scope, $scope.login.username, $scope.login.password);
        $scope.saltApiLoginPromise.success(function(data, status, headers, config) {
          var auth, saltApiAuth, _ref1;
          if ((data != null ? (_ref1 = data["return"]) != null ? _ref1[0] : void 0 : void 0) != null) {
            auth = data["return"][0];
            saltApiAuth = {
              user: auth.user,
              token: auth.token,
              eauth: auth.eauth,
              start: auth.start,
              expire: auth.expire,
              perms: auth.perms[0]
            };
            $scope.loggedIn = true;
            SessionStore.set('loggedIn', $scope.loggedIn);
            $scope.username = saltApiAuth.user;
            SessionStore.set('saltApiAuth', saltApiAuth);
            $rootScope.$broadcast('ToggleAuth', $scope.loggedIn);
          }
          return true;
        });
        return true;
      };
      $scope.loginFormError = function() {
        var erroredFields, msg, name, requiredFields;
        msg = "";
        if ($scope.loginForm.$dirty && $scope.loginForm.$invalid) {
          requiredFields = ["username", "password"];
          erroredFields = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = requiredFields.length; _i < _len; _i++) {
              name = requiredFields[_i];
              if ($scope.loginForm[name].$error.required) {
                _results.push($scope.loginForm[name].$name.substring(0, 1).toUpperCase() + $scope.loginForm[name].$name.substring(1));
              }
            }
            return _results;
          })();
          if (erroredFields) {
            msg = erroredFields.join(" & ") + " missing!";
          }
        }
        return msg;
      };
      return true;
    }
  ]);

  mainApp.controller('RouteCtlr', [
    '$scope', '$location', '$route', '$routeParams', 'Configuration', 'AppPref', function($scope, $location, $route, $$routeParams, Configuration, AppPref) {
      $scope.location = $location;
      $scope.route = $route;
      $scope.winLoc = window.location;
      $scope.baseUrl = Configuration.baseUrl;
      $scope.debug = AppPref.get('debug');
      $scope.errorMsg = '';
      return true;
    }
  ]);

}).call(this);