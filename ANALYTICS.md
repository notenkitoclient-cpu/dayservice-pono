# デイサービスぽのの計測導入準備

確認日：2026-10-12。管理アカウント：creatie.hw@gmail.com。

- GA4 G-4L9XQSM5XR / GTM GTM-MQ63QN7S。新規プロパティ・コンテナ作成済み。
- 明示的同意後に正式origin https://dayservice-pono.com のトップだけ手動page_view。クエリ付きページ・管理画面・確認用URLでは計測しない。ハッシュは送信せずページ内移動を別PVに数えない。
- 連絡ボタンは意向を示す click_to_call / outbound_contact として計測。氏名・本文・連絡先・リンク文字列・リンク先の連絡先は送信しない。フォームの見かけの成功表示を完了として数えない。
- 広告用途OFF、DNT/GPC優先、同意90日、撤回時に解析Cookieを除去。URL/タイトル/参照元は固定または許可されたoriginに限定。
- アクセス解析説明・変更ボタン・同意UIを追加。
- GTM Googleタグの公開、サイト側コード本番反映、GA4受信、保持14か月、GSC関連付け、BigQueryは未完了。ブラウザ操作機能エラーでGoogle側設定を保存できていない。
- 解析を使うページやイベントを増やす場合は、本方針と送信内容を見直す。

確認：JavaScript構文検査、HTMLの解析スクリプト1本・canonical、サイトマップXML、git差分検査が成功。テストスイート・実フォーム送信・GA4確認イベントは未実行。

Cloudflare PagesのHTML拡張子省略への転送に合わせ、公開リンク/canonical/サイトマップは /privacy、保存ファイルは privacy.html。公式資料：https://developers.cloudflare.com/pages/configuration/serving-pages/
