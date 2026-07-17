# Google Search Console 所有権確認の手順(HTMLファイル方式)

Google Search Console にサイトを登録し、
「HTMLファイルをルート直下にアップロードする方式」で所有権を確認する手順です。

## リポジトリ構成の事前確認結果(確認済み・問題なし)

このリポジトリ(yorisoi-connect.github.io)は以下の理由により、
ルート直下に検証用HTMLファイルを置くだけでそのまま公開されます。

- GitHub Pages がリポジトリのルートをそのままサイトのルート
  (`https://yorisoi-connect.com/`)として配信している
  (`CNAME` ファイルで独自ドメイン設定済み)
- ビルド処理による除外の心配なし:検証ファイル名(`googleXXXX.html`)は
  Jekyll が除外する命名(先頭がアンダースコア等)に該当しない
- `robots.txt` は `Allow: /` のみで、検証ファイルへのアクセスを妨げない

**結論:構成上の問題はありません。ファイルを置くだけでOKです。**

## 手順

### 1. Search Console でプロパティを追加する

1. https://search.google.com/search-console にGoogleアカウントでログイン
2. 左上のプロパティ選択 → 「プロパティを追加」
3. プロパティタイプは **「URLプレフィックス」** を選択し、
   `https://yorisoi-connect.com/` を入力して「続行」

   ※「ドメイン」プロパティはDNSレコードの追加が必要なため、
   今回はHTMLファイル方式が使える「URLプレフィックス」を使います。

### 2. 検証用HTMLファイルをダウンロードする

1. 確認方法の一覧から **「HTMLファイル」** を選択
2. `googleXXXXXXXXXXXXXXXX.html`(XXXXは固有の英数字)という
   ファイルをダウンロードする

### 3. リポジトリのルート直下に配置してプッシュする

```bash
# ダウンロードしたファイルをリポジトリ直下にコピー(ファイル名は実際のものに置き換え)
cp ~/Downloads/googleXXXXXXXXXXXXXXXX.html /home/tokaji/workspace/yorisoi-connect/

cd /home/tokaji/workspace/yorisoi-connect
git add googleXXXXXXXXXXXXXXXX.html
git commit -m "Search Console所有権確認用ファイルを追加"
git push
```

**注意:このファイルは中身を一切編集しないこと。また、所有権確認後も削除しないこと**
(削除すると所有権が失効します)。

### 4. 公開されたことを確認する

GitHub Pages への反映(通常1〜2分)を待ってから、ブラウザで

```
https://yorisoi-connect.com/googleXXXXXXXXXXXXXXXX.html
```

を開き、`google-site-verification: googleXXXX.html` という
テキストが表示されることを確認します。

### 5. Search Console に戻って「確認」をクリック

「所有権を確認しました」と表示されれば完了です。

### 6. 確認後にやっておくこと

1. **サイトマップの送信**:
   左メニュー「サイトマップ」→ `sitemap.xml` と入力して送信
   (`https://yorisoi-connect.com/sitemap.xml` は作成済み)
2. **GA4との連携**:
   GA4の「管理 → サービス間のリンク設定 → Search Console のリンク」から
   このプロパティをリンクすると、GA4上でも検索クエリが見られるようになります
   (詳細は docs/analytics-manual-tasks.md を参照)

## 反映後に見られるようになるデータ

- どんな**検索キーワード**でサイトが表示・クリックされたか
  (「検索パフォーマンス」レポート。データが貯まるまで数日かかります)
- どのページがGoogleにインデックスされているか
- モバイル対応やページ体験の問題
