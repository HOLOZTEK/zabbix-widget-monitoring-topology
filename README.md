# Monitoring Map Widget for Zabbix

Zabbixの監視経路（ZabbixServer / Proxy / Network / Host のつながり）をトポロジー図として可視化するウィジェットです。Vis Network（Canvas2D）を使用します。

`zabbix-widget-topologymap-visnetwork` をベースに、ホストグループ⇔ホストの2階層グラフから、監視経路（Server-Network-Proxy-Network-Host）を表現する4階層グラフへ拡張した独立ウィジェットです。

## 機能

- ZabbixServer / Proxy / ネットワーク（サブネット） / ホストをノードとしてグラフ表示
- ホストのインターフェースIPからネットワーク（サブネット）ノードを自動算出（マスク長は設定可能）
- ホストの種類に応じたアイコン表示（Linux / Windows / ネットワーク機器 / 仮想 / サーバー）
- 通信方式（Ping / SNMP / Agent / IPMI / VMware / ODBC / JMX）をホストノードに併記
- Tree Navigatorウィジェットと連動（ホスト/ホストグループ選択のブロードキャストを受信し、対象範囲を絞り込み表示）
- オブジェクト表示 / アイコン表示の切り替え
- 物理シミュレーションによる自動レイアウト・ノードのドラッグ調整
- ホストノードクリックでホスト詳細画面へ遷移
- ノードホバーでツールチップ表示

## 動作要件

- Zabbix 7.0 以上
- Canvas2D 対応ブラウザ（WebGL 不要）

## インストール

### RPM パッケージ（推奨）

```bash
rpm -ivh zabbix-widget-monitoring-topology-1.0.1.noarch.rpm
systemctl reload httpd php-fpm
```

### 手動インストール

```bash
cp -r zabbix-widget-monitoring-topology /usr/share/zabbix/modules/holoztek_monitoringmap
systemctl reload httpd php-fpm
```

Zabbix 管理画面 → 管理 → モジュール からウィジェットを有効化してください。

## 使い方

このウィジェットは単独では何も表示しません。同一ダッシュボードに Tree Navigator 等のホスト/ホストグループを送信するウィジェットを配置し、ブロードキャスト連携を設定してください。

- ホストを選択した場合: ZabbixServerからそのホストまでの経路を表示します。
- ホストグループを選択した場合: グループに属する全ホストの経路を表示します。

## 旧ID（monitoringmap）からのアップグレード手順

v1.0.1 で、Zabbix モジュールの内部識別子（`manifest.json` の `id`）が
`monitoringmap` から `holoztek_monitoringmap` へ変更されました。この変更は
他ベンダーのモジュールとの名前衝突を避けるためのもので、v1.0.0 以前から
アップグレードする場合は以下の手順が必要です。

1. **パッケージの更新**（RPM/DEB を新バージョンで上書きインストール、または
   ファイルを直接配置）。モジュール配置ディレクトリ名も `monitoringmap` から
   `holoztek_monitoringmap` へ変更されています（他ベンダーのモジュールとの
   ファイルシステム上の衝突を避けるため）。RPM/DEB パッケージはインストール
   時に旧ディレクトリの中身が本パッケージ由来であることを確認した上で自動的
   に移行・削除します。手動インストールの場合は
   `/usr/share/zabbix/modules/monitoringmap` を新しい
   `holoztek_monitoringmap` ディレクトリへ手動で移行してください。
2. **モジュールの再スキャンと再有効化**: Zabbix 管理画面 → 管理 → モジュール
   で「今すぐスキャン」を実行し、新しい ID（`holoztek_monitoringmap`）の
   モジュールを検出させたうえで有効化します。旧 ID（`monitoringmap`）の
   モジュールが一覧に残っている場合は無効化（または削除）してください。
3. **既存ダッシュボードのウィジェット type を更新**: 旧 ID で配置済みの
   ウィジェットは、Zabbix API で `type` フィールドのみを書き換えることで
   移行できます。`widgetid` ・設定フィールド（`fields`）・`reference` は
   変更不要です。
   ```php
   // 例: dashboard.get で対象ダッシュボードを取得後、
   // type が 'monitoringmap' のウィジェットのみ書き換えて dashboard.update
   foreach ($dashboard['pages'] as &$page) {
       foreach ($page['widgets'] as &$widget) {
           if ($widget['type'] === 'monitoringmap') {
               $widget['type'] = 'holoztek_monitoringmap';
           }
       }
   }
   ```
   同様のロジックを `dashboard.update` の呼び出し前に適用してください。
4. **テンプレートダッシュボードも移行対象に含める**: 通常のダッシュボードに
   加え、ホストテンプレートに含まれるテンプレートダッシュボード
   （`templatedashboard.get` / `templatedashboard.update`）にも同じ手順を
   適用してください。テンプレート側の移行漏れがあると、そのテンプレートを
   使うホストの表示のみ旧 ID のまま残ってしまいます。

## License

This project is licensed under the MIT License.

Copyright (c) 2026 ttake-55
HOLOZTEK by ttake-55
