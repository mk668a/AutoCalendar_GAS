//Slackのアクセストークン
//SLACK_ACCESS_TOKEN = "";

//出勤/退勤/時間をspledsheetに残す
function checkDate() {
  //日付を取得
  var d = new Date();
  //今日の日付のデータを取得する(ddを使いシートの日付を取得)
  var daily = Utilities.formatDate(d, "JST", "dd");
  //もし頭に0がついてしまう場合0は消す
  daily = Number(daily);
  //月を取得
  var month = Utilities.formatDate(d, "JST", "MM");

  //曜日
  //日曜が0、土曜日が6。配列を使い曜日に変換する。
  dateT = ["日", "月", "火", "水", "木", "金", "土"];
  var day = dateT[d.getDay()];
  //時
  var hours = ("0" + d.getHours()).slice(-2);
  //分
  var minutes = ("0" + d.getMinutes()).slice(-2);
  //時間を連結してテキストで渡す
  var DateTime = month + "月" + daily + "日(" + day + ") " + hours + ":" + minutes;
  return (DateTime);
}

//Outgoing WebHooksを利用して、投稿に反応させる
//Slackのkintaiチャンネルで入力したワードがこのイベントに入ってくる
function doPost(e) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var bot_name = "timer";
  var bot_icon = "";
  var verify_token = "";
  var post_text = e.parameter.text;
  var date_time;
  var state; //出勤か退勤か
  var error_text = "";

  //投稿の認証
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
  }
  var app = SlackApp.create(token);

  //時間の取得
  var nowdate = Date.now();
  date_time = checkDate();

  var num = Math.floor(Math.random() * 5 + 1);

  var beforestate = getBeforeState();

  if (post_text.match(/出勤/)) {
    if (beforestate == "出勤") {
      state = 0;
      var text = "まだ退勤してないよ!";

      //ボットからのコメント
      var message = e.parameter.user_name + "は" + text + "\n";
      app.postMessage(e.parameter.channel_id, message);

    } else {
      state = 1;
      var text = "今日も１日頑張ろう!";

      //ボットからのコメント
      var message = e.parameter.user_name + "、" + text + "\n" + date_time;
      app.postMessage(e.parameter.channel_id, message);
    }
  } else if (post_text.match(/退勤/)) {
   if (beforestate == "退勤") {
      state = 0;
      var text = "出勤してないよ!";

      //ボットからのコメント
      var message = e.parameter.user_name + "は" + text + "\n";
      app.postMessage(e.parameter.channel_id, message);

    } else {
    state = 2;
    var text = "お疲れさまです！";

    //ボットからのコメント
    var sum = getBeforeDate(nowdate);
    var message = e.parameter.user_name + "、" + text + "\n" + date_time + "\n" + "合計時間: " + sum + "分";
    app.postMessage(e.parameter.channel_id, message);
  }
  }

  //勤怠システムに書き込む
  if (state != 0) {
    //時間の取得(上の方で記載した関数)
    var date_time = checkDate();

    var postdata = {
      dt: date_time, //日付
      dcode: nowdate, //時間
      userName: e.parameter.user_name, //ユーザー
      state: state
    };

    //書き込む
    var result = getAttendance(postdata);
    if (result != 1) {
      error_text = "\n正しくスプレッドシートに記載できませんでした";
    } else {
      error_text = "";
    }
  }
}

//スプレに記載
function getAttendance(e) {
  var ss = SpreadsheetApp.openByUrl('');
  var sheet = ss.getSheets()[0];

  //最終列の取得
  var lastRow = sheet.getLastRow();
  var id = lastRow
  var entrytime = e.dt
  //時間
  var time = e.dcode
  //ユーザー名
  var name = e.userName;
  //出勤か退勤か
  var state = e.state;
  var isError;

  if (state == 1) {
    state = "出勤";
    if (!isError) {
      // データ入力
      sheet.appendRow([id, name, entrytime, time, state]);
      return (1);
    } else {
      return (2);
    }
  }
  if (state == 2) {
    state = "退勤";
    var sum = getBeforeDate(time);
    if (!isError) {
      // データ入力
      sheet.appendRow([id, name, entrytime, time, state, sum]);
      return (1);
    } else {
      return (2);
    }
  }
  if (state == 0) {
    isError = true;
  }
}

function getBeforeDate(time) {
  var ss = SpreadsheetApp.openByUrl('');
  var sheet = ss.getSheets()[0];
  //最終列の取得
  var lastRow = sheet.getLastRow();
  // 前回の時間を取得
  var beforetime = sheet.getRange(lastRow, 4).getValue();
  var sum = (time - beforetime) / 60000;
  return sum;
}

function getBeforeState() {
  var ss = SpreadsheetApp.openByUrl('');
  var sheet = ss.getSheets()[0];
  //最終列の取得
  var lastRow = sheet.getLastRow();
  // 出退勤状況を取得
  var state = sheet.getRange(lastRow, 5).getValue();
  return state;
}
