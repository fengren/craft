// Generated by CoffeeScript 1.7.1

/*
Service to handle operations related to displayig errors on the UI.

Maintains a list of all alerts. Exposes methods that add to and remove
items from that list.

Call ErrorReporter.getAlerts() to get the whole list of alerts.
ErrorReporter.removeAlert(0) removes the 0th alert from alerts.
Use ErrorReporter.addAlert() to add an alert.

The console page makes use of this service.
 */

(function() {
  angular.module("errorReportingSrvc", ['appUtilSrvc']).factory("ErrorReporter", function() {
    var alerts, servicer;
    alerts = [];
    servicer = {
      addAlert: function(type, msg) {
        if (type == null) {
          type = 'info';
        }
        if (msg == null) {
          msg = 'Error message!';
        }
        alerts.push({
          'type': type,
          'msg': msg
        });
      },
      removeAlert: function(index) {
        alerts.splice(index, 1);
      },
      getAlerts: function() {
        return alerts;
      }
    };
    return servicer;
  });

}).call(this);
