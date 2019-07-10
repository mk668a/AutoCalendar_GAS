/* セルが変更されたら実行してカレンダーのイベント名に【完了】を追加 */
function changeStatus(){

  var myCal = CalendarApp.getCalendarById(''); //カレンダーIDでカレンダーを取得
  var mySheet = SpreadsheetApp.getActiveSheet(); //シートを取得
  var myCell = mySheet.getActiveCell(); //アクティブセルを取得

  if(myCell.getColumn()==16){  //アクティブセルがP列かを判定

    var myEvtID = myCell.offset(0,-1).getValue(); //イベントID
    var myEvts = myCal.getEventsForDay(myCell.offset(0,-10).getValue()); //当日のイベントを取得

    for each(var evt in myEvts){ //取得したイベントの配列全てについて繰り返す
      if(evt.getId() == myEvtID){　//現在のIDが目的のIDであれば
        evt.setTitle(myCell.offset(0,0).getValue());
        if(evt.getTitle() == "予約済み"){
        evt.setColor(CalendarApp.EventColor.RED);
        }
        if(evt.getTitle() == "予約中"){
        evt.setColor(CalendarApp.EventColor.CYAN);
        }
      }
    }
  }
}
