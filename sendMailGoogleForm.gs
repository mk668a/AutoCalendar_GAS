function sendMailGoogleForm() {
 Logger.log('sendMailGoogleForm() debug start');

 //------------------------------------------------------------
 // 設定エリアここから
 //------------------------------------------------------------

 // 件名、本文、フッター
 var subject = "[ご利用申し込みがありました。]";
 var body
 = "ご利用申し込みがありました。\n\n"
 + "------------------------------------------------------------\n";
 var footer
 = "------------------------------------------------------------\n\n"
 + ""

 // 入力カラム名の指定
 var NAME_COL_NAME = 'お名前';
 var MAIL_COL_NAME = 'メールアドレス';


 // オプションメール送信先
 var admin = "@gmail.com"; // 管理者（必須）
 var sendername = "";//送信者名（必須）
 var cc = ""; // Cc:
 var bcc = admin; // Bcc:
 var reply = admin; // Reply-To:
 var to = ""; // To: （入力者のアドレスが自動で入ります）


 //------------------------------------------------------------
 // 設定エリアここまで
 //------------------------------------------------------------

 try{
 // スプレッドシートの操作
 var sheet = SpreadsheetApp.getActiveSheet();
 var rows = sheet.getLastRow();
 var cols = sheet.getLastColumn();
 var rg = sheet.getDataRange();
 Logger.log("rows="+rows+" cols="+cols);

 // メール件名・本文作成と送信先メールアドレス取得
 for (var i = 1; i <= cols-6; i++ ) {
 var col_name = rg.getCell(1, i).getValue(); // カラム名
 var col_value = rg.getCell(rows, i).getValue(); // 入力値

 ////////////タイムスタンプを消す////////////////
if (col_name === "タイムスタンプ"){
	continue;
}
////////////////上記を入れる////////////

 body += "【"+col_name+"】\n";
 body += col_value + "\n\n";
 if ( col_name === NAME_COL_NAME ) {
 body = col_value+" 様\n\n"+body;
 }
 if ( col_name === MAIL_COL_NAME ) {
 to = col_value;
 }
 }
 body += footer;

 // 送信先オプション
 var options = {name: sendername};
 if ( cc ) options.cc = cc;
 if ( bcc ) options.bcc = bcc;
 if ( reply ) options.replyTo = reply;

 // メール送信
 if ( to ) {
 MailApp.sendEmail(admin, subject, body, options);
 }else{
 MailApp.sendEmail(admin, "【失敗】Googleフォームにメールアドレスが指定されていません", body);
 }
 }catch(e){
 MailApp.sendEmail(admin, "【失敗】Googleフォームからメール送信中にエラーが発生", e.message);
 }
}
