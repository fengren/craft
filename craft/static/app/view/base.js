// Generated by CoffeeScript 1.7.1
(function() {
  var mainApp;

  mainApp = angular.module("MainApp");

  mainApp.controller('BaseController', [
    '$scope', '$location', '$route', '$q', '$filter', '$templateCache', '$timeout', 'Configuration', 'AppData', 'AppPref', 'Item', 'Itemizer', 'Minioner', 'Resulter', 'Jobber', 'ArgInfo', 'Runner', 'Wheeler', 'Commander', 'Pagerage', 'SaltApiSrvc', 'SaltApiEvtSrvc', 'SessionStore', 'ErrorReporter', 'HighstateCheck', 'EventDelegate', 'JobDelegate', 'FetchActives', 'Salt', '$filter', function($scope, $location, $route, $q, $filter, $templateCache, $timeout, Configuration, AppData, AppPref, Item, Itemizer, Minioner, Resulter, Jobber, ArgInfo, Runner, Wheeler, Commander, Pagerage, SaltApiSrvc, SaltApiEvtSrvc, SessionStore, ErrorReporter, HighstateCheck, EventDelegate, JobDelegate, FetchActives, Salt) {
      $scope.getAppData = function() {
        return AppData;
      };
      $scope.getSalt = function() {
        return Salt;
      };
      $scope.getFetchActives = function() {
        return FetchActives;
      };
      $scope.getCommands = function() {
        return AppData.getCommands();
      };
      $scope.getJobs = function() {
        return AppData.getJobs();
      };
      $scope.getMinions = function() {
        return AppData.getMinions();
      };
      $scope.getEvents = function() {
        return AppData.getEvents();
      };
      $scope.alerts = function() {
        return ErrorReporter.getAlerts();
      };
      $scope.closeAlert = function(index) {
        ErrorReporter.removeAlert(index);
      };
      $scope.addAlert = function(type, msg) {
        ErrorReporter.addAlert(type, msg);
      };
      $scope.fetchGrains = function(target, noAjax) {
        var cmd, minion, minions;
        if (noAjax == null) {
          noAjax = true;
        }
        cmd = {
          mode: "async",
          fun: "grains.items",
          tgt: target,
          expr_form: 'glob'
        };
        if (target == null) {
          minions = (function() {
            var _i, _len, _ref, _results;
            _ref = $scope.getMinions().values();
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              minion = _ref[_i];
              if (minion.active === true) {
                _results.push(minion.id);
              }
            }
            return _results;
          })();
          target = minions.join(',');
          cmd.tgt = target;
          cmd.expr_form = 'list';
        }
        if (noAjax) {
          $scope.graining = true;
        }
        SaltApiSrvc.run($scope, [cmd]).success(function(data, status, headers, config) {
          var job, result, _ref;
          result = (_ref = data["return"]) != null ? _ref[0] : void 0;
          if (result) {
            job = JobDelegate.startJob(result, cmd);
            if (job.done) {
              $scope.assignGrains(job);
              return;
            }
            job.commit($q).then(function(donejob) {
              $scope.assignGrains(donejob);
              if (noAjax) {
                return $scope.graining = false;
              }
            });
          }
          return true;
        }).error(function(data, status, headers, config) {
          ErrorReporter.addAlert("warning", "Failed to fetch Grains for " + target);
          if (noAjax) {
            return $scope.graining = false;
          }
        });
        return true;
      };
      $scope.assignGrains = function(job) {
        var grains, mid, minion, result, _i, _len, _ref, _ref1;
        _ref = job.results.items();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], mid = _ref1.key, result = _ref1.val;
          if (!result.fail) {
            grains = result["return"];
            minion = JobDelegate.snagMinion(mid);
            minion.grains.reload(grains, false);
          }
        }
        $scope.graining = false;
        return job;
      };
      $scope.snagCommand = function(name, cmds) {
        if ($scope.getCommands().get(name) == null) {
          $scope.getCommands().set(name, new Commander(name, cmds));
        }
        return $scope.getCommands().get(name);
      };
      $scope.fetchActives = function() {
        var cmd;
        cmd = {
          mode: "async",
          fun: "runner.manage.present"
        };
        $scope.statusing = true;
        SaltApiSrvc.run($scope, [cmd]).success(function(data, status, headers, config) {
          var job, result, _ref;
          result = (_ref = data["return"]) != null ? _ref[0] : void 0;
          if (result) {
            job = JobDelegate.startRun(result, cmd);
            if (job.done) {
              $scope.assignActives(job);
              $scope.$broadcast("Marshall");
              return;
            }
            job.commit($q).then(function(donejob) {
              $scope.assignActives(donejob);
              return $scope.$broadcast("Marshall");
            });
          }
          return true;
        }).error(function(data, status, headers, config) {
          ErrorReporter.addAlert("warning", "Failed to detect minions present");
          return $scope.statusing = false;
        });
        return true;
      };
      $scope.setActives = function(activeMinions) {
        var inactiveMinions, mid, minion, _i, _j, _len, _len1, _results;
        inactiveMinions = _.difference($scope.getMinions().keys(), activeMinions);
        for (_i = 0, _len = activeMinions.length; _i < _len; _i++) {
          mid = activeMinions[_i];
          minion = JobDelegate.snagMinion(mid);
          minion.activize();
        }
        _results = [];
        for (_j = 0, _len1 = inactiveMinions.length; _j < _len1; _j++) {
          mid = inactiveMinions[_j];
          minion = JobDelegate.snagMinion(mid);
          minion.unlinkJobs();
          _results.push(minion.deactivize());
        }
        return _results;
      };
      $scope.assignActives = function(job) {
        var mid, result, _i, _len, _ref, _ref1;
        _ref = job.results.items();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], mid = _ref1.key, result = _ref1.val;
          if (!result.fail) {
            $scope.setActives(result["return"]);
          }
        }
        $scope.statusing = false;
        return job;
      };
      $scope.openEventStream = function(callback, eventType) {
        if (eventType == null) {
          eventType = "salt/";
        }
        $scope.eventing = true;
        $scope.eventPromise = SaltApiEvtSrvc.events($scope, callback, eventType).then(function(data) {
          $scope.$emit('Activate');
          return $scope.eventing = false;
        }, function(data) {
          console.log("Error Opening Event Stream");
          if (SessionStore.get('loggedIn') === false) {
            ErrorReporter.addAlert("danger", "Cannot open event stream! Please login!");
          } else {
            ErrorReporter.addAlert("danger", "Cannot open event stream!");
          }
          $scope.eventing = false;
          return data;
        });
        return true;
      };
      $scope.closeEventStream = function() {
        SaltApiEvtSrvc.close();
        return true;
      };
      $scope.clearSaltData = function() {
        AppData.clearSaltData();
        return $scope.$broadcast("ClearSaltData");
      };
      $scope.authListener = function(event, loggedIn) {
        if (loggedIn) {
          $scope.openEventStream($scope.eventDispatch);
        } else {
          $scope.closeEventStream();
          $scope.clearSaltData();
        }
        return true;
      };
      $scope.activateListener = function(event) {
        $scope.fetchActives();
        if (AppPref.get("preloadJobCache", false)) {
          return $scope.preloadJobCache();
        }
      };
      $scope.eventDispatch = function(edata) {
        var _ref, _ref1, _ref2;
        if (((_ref = edata.data) != null ? (_ref1 = _ref.data) != null ? (_ref2 = _ref1.ret) != null ? _ref2.name : void 0 : void 0 : void 0) === 'event.fire_master') {
          return;
        }
        if (edata.tag.split('/')[0] === "salt") {
          if (edata.tag.split('/')[1] === 'presense') {
            if (edata.data.present != null) {
              $scope.setActives(edata.data.present);
            }
          } else {
            EventDelegate.processSaltEvent($scope, edata);
          }
        } else {
          return true;
        }
        return true;
      };
      $scope.docsLoaded = false;
      $scope.docKeys = [];
      $scope.docSearchResults = '';
      $scope.docs = {};
      $scope.isLoggedIn = function() {
        return SessionStore.get('loggedIn');
      };
      $scope.marshallListener = function(event) {
        if (AppPref.get("fetchGrains", false)) {
          $scope.fetchGrains();
        }
        $scope.fetchDocs();
        return $scope.highstatePoller();
      };
      $scope.highstatePoller = function() {
        if (!HighstateCheck.isHighstateCheckEnabled()) {
          return;
        }
        HighstateCheck.makeHighStateCall($scope);
        $timeout($scope.highstatePoller, HighstateCheck.getTimeoutMilliSeconds());
      };
      $scope.checkHighstateConsistency = function() {
        HighstateCheck.makeHighStateCall($scope);
      };
      $scope.isPerformingConsistencyCheck = function() {
        return HighstateCheck.isChecking();
      };
      $scope.isCheckingForHighstateConsistency = function() {
        return HighstateCheck.isHighstateCheckEnabled();
      };
      $scope.fetchDocsDone = function(donejob) {
        var key, minion_with_result, minions, results, value;
        results = donejob.results;
        minions = results._data;
        minion_with_result = _.find(minions, function(minion) {
          return minion.val.retcode === 0;
        });
        if (minion_with_result != null) {
          $scope.docs = minion_with_result.val["return"];
          $scope.docKeys = (function() {
            var _ref, _results;
            _ref = $scope.docs;
            _results = [];
            for (key in _ref) {
              value = _ref[key];
              _results.push("" + (key.toLowerCase()));
            }
            return _results;
          })();
          $scope.docsLoaded = true;
        } else {
          ErrorReporter.addAlert("warning", "Docs not loaded. Please check minions and retry");
        }
      };
      $scope.fetchDocsFailed = function() {
        return ErrorReporter.addAlert("warning", "Failed to fetch docs. Please check system and retry");
      };
      $scope.fetchDocs = function() {
        var command, _ref, _ref1;
        if (!(((_ref = $scope.getMinions()) != null ? (_ref1 = _ref.keys()) != null ? _ref1.length : void 0 : void 0) > 0)) {
          return;
        }
        command = {
          fun: 'sys.doc',
          mode: 'async',
          tgt: $scope.getMinions().keys()[0],
          expr_form: 'glob'
        };
        SaltApiSrvc.run($scope, command).success(function(data, status, headers, config) {
          var job, result, _ref2;
          result = (_ref2 = data["return"]) != null ? _ref2[0] : void 0;
          if (result) {
            job = JobDelegate.startJob(result, command);
            job.resolveOnAnyPass = true;
            job.commit($q).then($scope.fetchDocsDone, $scope.fetchDocsFailed);
            return true;
          }
        }).error(function(data, status, headers, config) {
          ErrorReporter.addAlert("warning", "HTTP Fetch Docs Failed!");
          return false;
        });
        return true;
      };
      $scope.tagMap = {};
      $scope.lookupJID = function(job_id) {
        var command;
        command = {
          fun: 'runner.jobs.lookup_jid',
          kwarg: {
            jid: job_id
          }
        };
        SaltApiSrvc.run($scope, command).success(function(data, status, headers, config) {
          var result;
          result = data["return"][0];
          return $scope.tagMap[result.tag.split('/')[2]] = job_id;
        });
        return true;
      };
      $scope.cachedJIDs = [];
      $scope.failedCachedJIDs = [];
      $scope.$on("CacheFetch", function(event, edata) {
        if (edata != null) {
          $scope.cachedJIDs = _.difference($scope.cachedJIDs, [edata.jid]);
          if (!edata.success) {
            $scope.failedCachedJIDs.push(edata.jid);
          }
        }
        if ($scope.cachedJIDs.length !== 0) {
          $scope.lookupJID($scope.cachedJIDs[0]);
        }
      });
      $scope.preloadJobCache = function() {
        var command;
        command = {
          fun: 'runner.jobs.list_jobs',
          tgt: []
        };
        SaltApiSrvc.run($scope, command).success(function(data, status, headers, config) {
          var job, result;
          result = data["return"][0];
          job = JobDelegate.startRun(result, command);
          job.commit($q).then(function(donejob) {
            var cmd, jid, val, _ref;
            _ref = donejob.results.items()[0].val.results()[0];
            for (jid in _ref) {
              val = _ref[jid];
              cmd = {
                fun: val.Function
              };
              if (val.Target != null) {
                cmd.tgt = val.Target;
              }
              if (!$scope.getJobs().get(jid)) {
                $scope.getJobs().set(jid, new Runner(jid, cmd));
                $scope.cachedJIDs.push(jid);
              }
            }
            return $scope.$emit("CacheFetch");
          }, function() {
            ErrorReporter.addAlert("warning", "List all jobs failed! Please retry");
            return true;
          });
          return true;
        });
        return true;
      };
      $scope.processLookupJID = function(data) {
        var key, result, results, val, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
        results = new Itemizer();
        _ref = data["return"];
        for (key in _ref) {
          val = _ref[key];
          result = new Resulter();
          result["return"] = val;
          result.id = key;
          results.set(key, result);
          if (data.success) {
            result.done = true;
            result.success = true;
            result.fail = false;
          }
          if ((_ref1 = $scope.getJobs().get($scope.tagMap[data.jid])) != null) {
            _ref1.results = results;
          }
        }
        if (data.success) {
          if ((_ref2 = $scope.getJobs().get($scope.tagMap[data.jid])) != null) {
            _ref2.done = true;
          }
          if ((_ref3 = $scope.getJobs().get($scope.tagMap[data.jid])) != null) {
            _ref3.fail = false;
          }
          $scope.$emit("CacheFetch", {
            succes: true,
            jid: $scope.tagMap[data.jid]
          });
        }
        if (!data.success) {
          if ((_ref4 = $scope.getJobs().get($scope.tagMap[data.jid])) != null) {
            _ref4.done = false;
          }
          if ((_ref5 = $scope.getJobs().get($scope.tagMap[data.jid])) != null) {
            _ref5.fail = true;
          }
          return $scope.$emit("CacheFetch", {
            succes: false,
            jid: $scope.tagMap[data.jid]
          });
        }
      };
      $scope.$on('ToggleAuth', $scope.authListener);
      $scope.$on('Activate', $scope.activateListener);
      $scope.$on('Marshall', $scope.marshallListener);
      if (!SaltApiEvtSrvc.active && SessionStore.get('loggedIn') === true) {
        $scope.openEventStream($scope.eventDispatch);
      }
      return true;
    }
  ]);

}).call(this);