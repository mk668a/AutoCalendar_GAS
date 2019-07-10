/* 指定月のカレンダーからイベントを取得する */
function addTaskEvents() {

  var myCal = CalendarApp.getCalendarById(''); //カレンダーIDでカレンダーを取得
  var mySheet = SpreadsheetApp.getActiveSheet(); //シートを取得
  var dat = mySheet.getDataRange().getValues(); //シートデータを取得

  for(var i=1;i<dat.length;i++){
    if(dat[i][14] == ""){

      /* 日時をセット */
      var evtDateS = new Date(dat[i][5]);
      var evtTimeS = new Date(dat[i][6]);
      evtDateS.setHours(evtTimeS.getHours());
      evtDateS.setMinutes(evtTimeS.getMinutes());

      var evtDateE = new Date(dat[i][5]);
      var evtTimeE = new Date(dat[i][7]);
      evtDateE.setHours(evtTimeE.getHours());
      evtDateE.setMinutes(evtTimeE.getMinutes());

      dat[i][15]='予約中';

      /* イベントの追加・スプレッドシートへの入力 */
      var myEvt = myCal.createEvent(dat[i][15],evtDateS,evtDateE); //カレンダーにタスクをイベントとして追加

      dat[i][15]='予約中';
      dat[i][14]=myEvt.getId(); //イベントIDを入力
    }
  }
  mySheet.getRange(1,1,i,16).setValues(dat); //データをシートに出力
}
