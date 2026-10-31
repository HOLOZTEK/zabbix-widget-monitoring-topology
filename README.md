# Monitoring Topology Widget for Zabbix

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
- バックエンド構成（Zabbix DB / Proxy DB / APM）の表示（任意・既定 OFF）

## 動作要件

- Zabbix 7.0 以上
- Canvas2D 対応ブラウザ（WebGL 不要）

## インストール

### RPM パッケージ（推奨）

```bash
rpm -ivh zabbix-widget-monitoring-topology-<version>.noarch.rpm
systemctl reload httpd php-fpm
```

### 手動インストール

```bash
cp -r zabbix-widget-monitoring-topology /usr/share/zabbix/modules/holoztek_monitoringmap
systemctl reload httpd php-fpm
```

Zabbix 管理画面 → 管理 → モジュール からウィジェットを有効化してください。

## 使い方

表示対象は設定画面で次のどちらかの方法で指定します。指定がない場合は何も表示しません。

- **ホストグループを固定指定**: 「ホストグループ」欄で特定のホストグループを複数選択できます（サブグループのホストも含みます）。
- **ブロードキャスト連携**: 同一ダッシュボードに Tree Navigator 等のホスト/ホストグループを送信するウィジェットを配置し、「ホスト」欄または「ホストグループ」欄で送信元ウィジェットを選択します。ホストは連携でのみ指定できます。

固定のホストグループと連携のホストを同時に指定した場合は、両方の和集合を表示します。

- ホストを選択した場合: ZabbixServerからそのホストまでの経路を表示します。
- ホストグループを選択した場合: グループに属する全ホストの経路を表示します。

## バックエンド構成 / Backend components

設定画面の「バックエンド構成」で、監視経路とは別に Zabbix のバックエンドを図へ追加できます。既定ではどちらも OFF で、OFF の間は従来と同じ表示です。

| 設定 | 表示内容 | 対応バージョン |
|------|----------|----------------|
| データベース | Zabbix DB、表示中の各 Proxy の Proxy DB | Zabbix 7.0 以上 |
| APM | ClickHouse / APM Data Store、APM 有効 Proxy | Zabbix 8.0 以上（7.0 では無視されます） |

構成例:

| 関係 | 接続 | 線 |
|------|------|-----|
| 監視 | Server — Proxy — Network — Host | 実線 |
| データベース | Server — Zabbix DB、Proxy — Proxy DB | 破線 |
| APM ストレージ | Server — ClickHouse — APM 有効 Proxy | 点線 |

- **Zabbix DB**: Server が報告したデータベース種別を表示します。取得できないときはフロントエンドの接続設定を参考情報として使い、ツールチップに取得元を示します。どちらも取得できなければ「Zabbix DB」のみを表示します。接続先アドレスは表示しません。
- **Proxy DB**: Zabbix API は Proxy のデータベース詳細を提供しないため、「Proxy DB」とだけ表示します。
- **APM Global Data Source**: Super admin が閲覧すると、Global Data Source が設定されている場合に ClickHouse として表示します。認証情報は取得結果から破棄し、画面へ渡しません。
- **APM 有効 Proxy**: APM Collector が有効な Proxy を表示します。監視対象 Host を持たない Proxy も表示し、同じ Proxy を二重には表示しません。「有効」は設定状態であり、テレメトリの受信を意味しません。
- **権限**: Super admin 以外は Global Data Source を読めません。APM 有効 Proxy があれば、種別を断定しない「APM Data Store」として表示します。
- **Override**: Proxy ごとの Override は API から取得できません。線は Global Data Source との関係を示すもので、その Proxy が実際にこの ClickHouse へ書き込むことを保証しません。
- **フィルター**: バックエンド構成のノードは Host フィルターの対象外です。Proxy DB は対応する Proxy に従います。Proxy クリック時のハイライトは監視経路のみを対象とします。

Backend components (Database / APM) are optional and off by default; while off, the widget behaves as before.

- **Database** (Zabbix 7.0+) adds a Zabbix DB node and one Proxy DB node per displayed Proxy. The database type comes from the Server, or from the Frontend configuration as a hint. Proxy database details are not available from the Zabbix API, so none are shown.
- **APM** (Zabbix 8.0+ only, ignored on 7.0) adds the Global Data Source as a ClickHouse node and shows APM-enabled Proxies, including those with no monitored Hosts. An enabled collector is a configuration state, not proof that telemetry is arriving.
- Only Super admins can read the Global Data Source. Other users see an abstract "APM Data Store" node when an APM-enabled Proxy exists. Credentials are never passed to the browser.
- The Global Data Source does not guarantee where a given Proxy actually writes: per-Proxy overrides are not available from the API.
- Backend nodes are not affected by the Host filter, and Proxy highlighting follows monitoring edges only.

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
