# おとなり屋 ランディングページ

葛飾区の便利屋サービス「おとなり屋」のLPです。
(旧名称「まかせて屋」から2026年7月に改名。旧URL `/makaseteya/` は本ページへ自動転送されます)

- 公開URL: https://yorisoi-connect.com/otonariya/
- 構成: `index.html` + `style.css` のみの静的ページ(ビルド不要)

## 画像の差し替え手順

現在 `images/` の中身は仮画像(単色のプレースホルダー)です。
**同じファイル名で上書き**すれば、HTML/CSSの変更なしで反映されます。

| ファイル | 用途 | 推奨サイズ |
|---|---|---|
| `images/tsunagu.png` | マスコット犬「つなぐ」(ファーストビュー) | 幅400px以上の正方形。背景透過PNG推奨 |
| `images/daihyo.png` | 代表 戸梶 凌の顔写真(「安心してご利用いただくために」) | 400×400px程度の正方形(丸くトリミングされて表示されます) |

手順:

1. 新しい画像を `otonariya/images/tsunagu.png`(または `daihyo.png`)として上書き保存
2. コミットしてプッシュ

```sh
cd ~/workspace/yorisoi-connect
git add otonariya/images/
git commit -m "おとなり屋LPの画像を差し替え"
git push origin main
```

3. 1〜2分待ってから https://yorisoi-connect.com/otonariya/ をスマホで再読み込みして確認
   (古い画像が表示される場合はブラウザのキャッシュが原因。ページを強制再読み込みしてください)

※ 別のファイル形式(jpgなど)を使いたい場合は、`index.html` 内の
`images/tsunagu.png` / `images/daihyo.png` の記述を新しいファイル名に書き換えてください。
