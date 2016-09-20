var assert = require('assert');
var inspector = require("./index").handler;

var target = "arn:aws:inspector:ap-northeast-1:663889673734:target/0-e23PBIlz";
var template = target + "/template/0-EEEDd3pP";
var run = template + "/run/0-x7O7yqEi";
var finding = run + "/finding/0-G9DSWTSW";

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


var finding_sample = {
  "updatedAt": "2016-09-20T02:34:49.189Z",
  "createdAt": "2016-09-20T02:34:49.189Z",
  "title": "Instance i-18d5a797 is configured to allow users to log in with root credentials over SSH. This increases the likelihood of a successful brute-force attack.",
  "id": "Disable root login over SSH",
  "assetAttributes": {
    "ipv4Addresses": [],
    "agentId": "i-18d5a797",
    "schemaVersion": 1
  },
  "assetType": "ec2-instance",
  "serviceAttributes": {
    "rulesPackageArn": "arn:aws:inspector:ap-northeast-1:406045910587:rulespackage/0-bBUQnxMq",
    "assessmentRunArn": "arn:aws:inspector:ap-northeast-1:663889673734:target/0-e23PBIlz/template/0-EEEDd3pP/run/0-x7O7yqEi",
    "schemaVersion": 1
  },
  "service": "Inspector",
  "schemaVersion": 1,
  "arn": "arn:aws:inspector:ap-northeast-1:663889673734:target/0-e23PBIlz/template/0-EEEDd3pP/run/0-x7O7yqEi/finding/0-G9DSWTSW",
  "description": "This rule helps determine whether the SSH daemon is configured to permit logging in to your EC2 instance as root.",
  "recommendation": "It is recommended that you configure your EC2 instance to prevent root logins over SSH. Instead, log in as a non-root user and use **sudo** to escalate privileges when necessary. To disable SSH root logins, set **PermitRootLogin** to \"no\" in **/etc/ssh/sshd_config** and restart sshd.",
  "severity": "Medium",
  "numericSeverity": 6,
  "confidence": 10,
  "indicatorOfCompromise": false,
  "attributes": [
    {
      "value": "i-18d5a797",
      "key": "INSTANCE_ID"
    }
  ],
  "userAttributes": []
};

