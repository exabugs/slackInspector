var assert = require('assert');
var inspector = require("./index").handler;

var target = "arn:aws:inspector:ap-northeast-1:663889673734:target/0-FcroYIWk";
var template = target + "/template/0-I54Pi2HY";
var run = template + "/run/0-n4tHZBa9";
var finding = run + "/finding/0-yqoeJtLo";

function param(event, finding, newstate) {
  var message = {
    event: event,
    target: target,
    template: template,
    run: run,
    finding: finding,
    newstate: newstate
  };
  var event = {
    Records: [
      {
        Sns: {
          Message: JSON.stringify(message)
        }
      }
    ]
  };
  return event;
}

describe('test f', function () {

  function wait(next) {
    setTimeout(next, 500);
  }

  it('ASSESSMENT_RUN_STARTED', function (next) {
    var event = param("ASSESSMENT_RUN_STARTED");
    inspector(event, {}, function () {
      wait(next);
    });
  });

  it('FINDING_REPORTED', function (next) {
    var event = param("FINDING_REPORTED", finding);
    inspector(event, {}, function () {
      wait(next);
    });
  });

  it('ASSESSMENT_RUN_COMPLETED', function (next) {
    var event = param("ASSESSMENT_RUN_COMPLETED");
    inspector(event, {}, function () {
      wait(next);
    });
  });

  it('ASSESSMENT_RUN_STATE_CHANGED', function (next) {
    var event = param("ASSESSMENT_RUN_STATE_CHANGED", undefined, "DATA_COLLECTED");
    inspector(event, {}, function () {
      wait(next);
    });
  });


  it('__ERROR__', function (next) {
    var event = param("__ERROR__");
    inspector(event, {}, function () {
      wait(next);
    });
  });

  it('wait', function (next) {
    setTimeout(next, 1000);
  });
});
