//Slackのアクセストークン
// ファイル -> プロジェクトのプロパティ -> スクリプトのプロパティ で設定
//SLACK_ACCESS_TOKEN = "xoxb-596777847489-689703624197-4a0gnwxr1uQ2L8RLUZ8oM7DS";

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
  var bot_icon = "https://dl.dropboxusercontent.com/s/fr80p23peufksxu/alarm-clock.png";
  //Outgoing WebHooksのTOKENをここにコピペ
  var verify_token = "KGQSd2kinKttmBQ8inYADLbj";
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
  date_time = checkDate();

  var num = Math.floor(Math.random() * 5 + 1);

  if (post_text.match(/出勤/)) {
    state = 1;
    var text = "今日も１日頑張ろう!";
  } else if (post_text.match(/退勤/)) {
    state = 2;
    var text = "お疲れさまです！";
  }

  //勤怠システムに書き込む
  if (state != 0) {
    //時間の取得(上の方で記載した関数)
    var date_time = checkDate();

    var postdata = {
      dt: date_time, //時間
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

  //ボットからのコメント
  var message = e.parameter.user_name + "、" + text + "\n" + date_time;
  app.postMessage(e.parameter.channel_id, message);

}

//スプレに記載
function getAttendance(e) {
  // var ss = SpreadsheetApp.openByUrl('スプレッドシートのURL');
  var ss = SpreadsheetApp.openByUrl('https://docs.google.com/spreadsheets/d/1x20Ehlq7Pu3XZhA0mOv9UbIQ4NYE3aceKRzDFLvJNqc/edit?usp=sharing');
  var sheet = ss.getSheets()[0];

  //最終列の取得
  var lastRow = sheet.getLastRow();
  var id = lastRow;
  //時間
  var entrytime = e.dt
  //ユーザー名
  var name = e.userName;
  //出勤か退勤か
  var state = e.state;
  var isError;

  if (state == 1) {
    state = "出勤";
  }
  if (state == 2) {
    state = "退勤";
  }
  if (state == 0) {
    isError = true;
  }

  if (!isError) {
    // データ入力
    sheet.appendRow([id, name, entrytime, state]);
    return (1);
  } else {
    return (2);
  }

}
