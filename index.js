// https://nodejs.org/docs/v4.3.2/api/

// Set your slack url here.
const slack = "/services/T0DD9AQER/B0DDBKWSX/xxxxxxxxxxxxxxxxxxxxxxxx";

const AWS = require("aws-sdk");

AWS.config.apiVersions = {
  inspector: "2016-02-16"
};

const inspector = new AWS.Inspector();

const https = require('https');


//
// Slack message format.
//
function build(template, target, message) {

  var events = {
    "ASSESSMENT_RUN_STARTED": "実行開始",
    "ASSESSMENT_RUN_COMPLETED": "実行完了",
    "ASSESSMENT_RUN_STATE_CHANGED": "実行ステータスが変更されました",
    "FINDING_REPORTED": "報告された結果"
  };

  var buff = [
    [
      target.name,
      template.name,
      events[message.event]
    ].join(":")
  ];

  switch (message.event) {
    case "FINDING_REPORTED":
      buff.push(message.finding);
      break;
    case "ASSESSMENT_RUN_STARTED":
    case "ASSESSMENT_RUN_COMPLETED":
      break;
    case "ASSESSMENT_RUN_STATE_CHANGED":
      buff.push(message.newstate);
      break;
    default:
      buff = null; // 通知しない
      break;
  }

  return buff && buff.join("\n");
}

//
// Lambda entry point
//
exports.handler = function (event, context, callback) {
  console.log("inspector lambda start : " + new Date());

  var messages = event.Records.reduce(function (memo, v) {
    if (v.Sns && v.Sns.Message) {
      memo.push(JSON.parse(v.Sns.Message));
    }
    return memo;
  }, []);

  Promise.all([
    inspector.describeAssessmentTemplates({
      assessmentTemplateArns: pluck(messages, "template")
    }).promise(),
    inspector.describeAssessmentTargets({
      assessmentTargetArns: pluck(messages, "target")
    }).promise()
  ]).then(function (result) {
    var templates = result[0].assessmentTemplates;
    var targets = result[1].assessmentTargets;
    return Promise.all(messages.map(function (message, idx) {
      var text = build(templates[idx], targets[idx], message);
      return text && request({text: text});
    }));
  }).then(function () {
    callback();
  }).catch(function (err) {
    console.log(err);
    callback(err);
  });
};

//
// Slack
//
function request(data) {
  return new Promise(function (resolve) {
    var body = JSON.stringify(data);

    var req = https.request({
      hostname: "hooks.slack.com",
      port: 443,
      path: slack,
      method: "POST",
      headers: {
        'Content-Type': 'application/json; charser=UTF-8',
        "Content-Length": Buffer.byteLength(body)
      }
    });

    req.end(body, function (err) {
      resolve(err);
    });
  });
}

// utility

function pluck(array, propertyName) {
  return array.map(function (v) {
    return v[propertyName];
  });
}
