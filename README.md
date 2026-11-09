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
- OpenTelemetry Topology（Proxy → OpenTelemetry サービス → OpenTelemetry システム）の表示（Zabbix 8.0 以上・[導入ガイド](docs/OTEL_TOPOLOGY_SETUP.ja.md) / [Setup Guide](docs/OTEL_TOPOLOGY_SETUP.md)）

## 動作要件

- Zabbix 7.0 以上（8.0.0 で動作確認）
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

### 表示状態の維持 / Keeping the view

ウィジェットの更新では、拡大位置、ノード位置（ドラッグした位置を含む）、Proxy ハイライトを維持します。増えたノードだけを配置し、消えたノードは取り除きます。ブロードキャスト（ナビゲータなど）で表示対象のホスト／ホストグループが変わったときは、全体を配置し直して表示範囲を合わせます。ノードをドラッグすると、設定「ドラッグ時の追従ホップ数」（0〜10、既定は 6）以内のノードだけが追従し、それより離れたノードと手動で置いたノードは動きません。0 ならドラッグしたノードだけが動きます。設定「表示前の配置計算回数」（0〜1000、既定は 0）で、新しく配置し直すとき（初回表示、表示対象のホスト／ホストグループの変更、構成の大きな変化）の見せ方を選べます。0 は配置の計算が終わってから表示します。1 以上は指定した回数だけ計算してから表示し、広がって落ち着くまでの動きを見せます（最長 20 秒）。値が小さいほど大きく動きます。落ち着いたら止めて表示範囲を合わせ直します。どちらでも、定期更新ではノードは動きません。全体表示に戻るのは初回表示時、表示対象のホスト／ホストグループが変わったとき、構成が大きく変わったとき、画面内に表示対象がなくなったときです。

Refreshes keep the zoom, pan, node positions (including dragged nodes) and Proxy highlight. Only added nodes are placed; removed nodes are dropped. When a broadcast (e.g. from a navigator) changes the selected hosts / host groups, the whole topology is laid out again and fitted. Dragging a node also moves the nodes within the "Drag follow hops" setting (0-10, default 6); nodes further away and nodes placed by hand stay put. With 0, only the dragged node moves. The "Layout iterations before display" setting (0-1000, default 0) chooses how a fresh layout (first display, a change of the selected hosts / host groups, a substantially different topology) is shown: 0 shows it once the layout is done; 1 or more shows it after that many iterations and lets it spread out on screen until it settles (at most 20 s), then stops and fits again. The smaller the value, the more it moves. Either way, refreshes do not move nodes. The view fits again only on first display, when the selected hosts / host groups change, on a substantially different topology, or when nothing remains in view.

### 設定画面 / Settings

設定画面は [監視対象] [バックエンド / APM] [表示] の3タブです。[監視対象] はホスト・ホストグループ・サブネットマスク長・Zabbix Server ラベル、[バックエンド / APM] は「バックエンド構成」と「OTel観測期間（分）」、[表示] はフォント・エッジ・ドラッグ時の追従ホップ数・表示前の配置計算回数・フィルタアイコンの位置・関係の初期表示です。タブはまとめ方を変えただけで、保存される設定項目は従来と同じです。

The settings form has three tabs: Monitoring targets (hosts, host groups, subnet prefix length, Zabbix Server label), Backend / APM (Backend components, OTel observation window) and Display (fonts, edges, drag follow hops, layout iterations, filter icon position, default relation visibility). The tabs only group the fields; saved settings are unchanged.

### 検索・全体表示・情報 / Search, fit and info

設定「フィルタアイコンの位置」の隅（既定は右上）のツールバーに [検索] [全体を表示] [情報] [フィルター] が並びます。

- **検索**: 表示中のノードを名前で検索します（大文字・小文字を区別しない部分一致、最大 20 件）。OTel Service は `service.name`、OTel System は `host.name` で表示・検索され、名前空間・環境でも見つかります。OTel System は所属する Service 名でも見つかります。候補には種別（OpenTelemetry サービス／システム）を表示します。クラスターはメンバーのアドレスでも検索できます。候補を選ぶとそのノードへ移動して枠で強調します。フィルターで非表示のノードは候補になりません。Enter で選択、Esc で検索をクリアします。検索語と選択は更新後も維持されます。
- **全体を表示**: フィルターで表示中のノードがすべて収まるように表示します。
- **情報**: 次の3つを表示します（従来の [凡例] を拡張したもの）。フィルターパネルとは同時に開きません。開いたままでも定期更新で最新の値に変わります。
  - **トポロジー**: 取得したノード数・関係数（フィルターで非表示のものも含む）と、データベース構成の有効／無効。
  - **APM / OpenTelemetry**: 観測期間、今回の取得で得た Span 数（複数クエリの合計）、実行したクエリ数／上限、OTel サービス数・システム数、取得状況。APM が OFF のときは「無効」だけを表示します（Zabbix 7.0 では「Zabbix 8.0 以降が必要です」を添えます）。取得状況は、ウィジェットが確実に判断できるものだけを示します: 正常 / データなし（対象の APM 有効 Proxy がなくクエリを実行していない。権限不足かデータがないかは区別しません） / Spanなし / 表示上限に到達（OTel サービスまたはシステムが表示上限の 100 件に達した） / クエリ上限に到達（最大クエリ数を使っても、表示から漏れた組み合わせがないと確かめられなかった） / 取得失敗。権限エラーを推測して表示することはありません。
  - **凡例**: 現在の図にある関係（線種）とノード種別。

縮小表示では Zabbix サーバー、Proxy、Proxy グループ、APM データストア、Zabbix DB、OTel Service を大きく描き、関係の線種も見分けられる太さに保ちます。

The toolbar in the corner set by "Filter icon position" (top right by default) holds Search, Fit, Info and Filter.

- **Search** finds shown nodes by name (case-insensitive substring, up to 20 results); OTel services are listed by `service.name` and OTel systems by `host.name`; both also match their namespaces and environments, and a system also matches its service name. Each result shows its type (OpenTelemetry service / system). Clusters match their member addresses. Picking a result moves the view to the node and marks it with a frame. Nodes hidden by the filters are not offered. Enter picks, Esc clears. The query and the pick survive refreshes.
- **Fit** shows every node the filters leave visible.
- **Info** (formerly Legend) does not open together with the filter panel, and while open it follows each refresh. It has three sections:
  - **Topology**: the number of nodes and relations fetched (including those the filters hide) and whether the database topology is enabled.
  - **APM / OpenTelemetry**: the observation window, spans fetched by the latest update (summed over queries), queries run / maximum, OTel services and systems, and the retrieval status. With APM off it only says Disabled (on Zabbix 7.0, with "Requires Zabbix 8.0 or later"). The retrieval status states only what the widget knows for sure: OK / No data available (no APM-enabled Proxy to query, so no query was run; missing permissions and missing data are not told apart) / No spans fetched / Display limit reached (OTel services or systems hit the display limit of 100) / Query limit reached (after the maximum number of queries, a missed combination could not be ruled out) / Retrieval failed. Permission errors are never guessed.
  - **Legend**: the relations (line styles) and node types in the current graph.

When zoomed out, the Zabbix server, Proxies, Proxy groups, APM datastores, Zabbix DB and OTel services are drawn larger, and relation line styles stay distinguishable.

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
| テレメトリ | APM 有効 Proxy — OTel Service | 一点鎖線 |
| サービス所属 | OTel Service — OTel System | 二点鎖線 |

- **Zabbix DB**: Server が報告したデータベース種別を表示します。取得できないときはフロントエンドの接続設定を参考情報として使い、ツールチップに取得元を示します。どちらも取得できなければ「Zabbix DB」のみを表示します。接続先アドレスは表示しません。
- **Proxy DB**: Zabbix API は Proxy のデータベース詳細を提供しないため、「Proxy DB」とだけ表示します。
- **APM Global Data Source**: Super admin が閲覧すると、Global Data Source が設定されている場合に ClickHouse として表示します。認証情報は取得結果から破棄し、画面へ渡しません。
- **APM 有効 Proxy**: APM Collector が有効な Proxy を表示します。監視対象 Host を持たない Proxy も表示し、同じ Proxy を二重には表示しません。「有効」は設定状態であり、テレメトリの受信を意味しません。
- **権限**: Super admin 以外は Global Data Source を読めません。APM 有効 Proxy があれば、種別を断定しない「APM Data Store」として表示します。
- **Override**: Proxy ごとの Override は API から取得できません。線は Global Data Source との関係を示すもので、その Proxy が実際にこの ClickHouse へ書き込むことを保証しません。
- **フィルター**: バックエンド構成のノードは Host フィルターの対象外です。Proxy DB は対応する Proxy に従います。Proxy クリック時のハイライトは監視経路のみを対象とします。

- **OTel Service / OTel System**: APM を ON にすると、Proxy を経由して観測された OpenTelemetry のテレメトリを「Proxy → OTel Service → OTel System」の固定階層で表示します。OTel Service は Resource Attribute の `service.name`、OTel System は `host.name` をノード名とします（大文字・小文字は区別します）。Service は「Proxy＋`service.name`」、System は「Proxy＋`service.name`＋`host.name`」で識別するため、同じ `host.name` でも Service や Proxy が異なれば別ノードです。`service.name` がないテレメトリは表示せず、`host.name` がない場合は Service だけを表示します。OTel のノードを Zabbix の Host と統合したり、Host と線で結んだりはしません。`service.namespace`・`deployment.environment` は識別に使わない補足情報で、ツールチップに表示し、検索でも使います。Zabbix 8.0 以上が対象です。
- **関係フィルター**: フィルターの「関係」で、取得済みの監視経路 / データベース / APM データストア / Telemetry を表示／非表示にできます（Telemetry は Proxy—Service と Service—System の両方の線と OTel ノードが対象）。表示中の関係につながるノードは残ります。取得の有無は設定「バックエンド構成」が決め、ホストのフィルターとは独立です。
- **取得と表示 / 関係の初期表示**: 「バックエンド構成」のデータベース・APM はデータの取得そのものを決めます。OFF の構成は取得せず、フィルターの対応する関係も選べません。フィルターの「関係」は取得済みの構成を表示するかだけを決め、非表示にしても取得は続きます（[情報] で取得状況を確認できます）。設定「関係の初期表示」（[表示] タブ）は、ダッシュボードを開いたときのフィルターの「関係」の初期状態です。取得しない関係は選べません。表示中にフィルターで変えた状態は定期更新では維持され、ページを読み込み直すと初期表示に戻ります（保存はしません）。フィルターの [リセット] も初期表示に戻します。この設定がない既存のウィジェットは、すべての関係を表示します。
- **性能**: APM を ON にすると、更新のたびに APM のトレース API へ最大 3 回のクエリを実行します。取得コストは送信元のテレメトリ量と「OTel観測期間（分）」に応じて増えることがあります。[情報] の表示と最終観測時刻は取得済みの Span から求め、クエリは増やしません。
- **最終観測**: OTel Service・OTel System のツールチップに「最終観測」を表示します。これはこのウィジェットが今回取得した Span のうち最新の時刻で、System はその System の Span、Service は配下のすべての System と `host.name` のない Span を含みます。ユーザーが最後にエージェントを使った時刻やプロセスの稼働時間を意味しません。バックグラウンドで Span を送る送信元では、操作がなくても更新されます。取得上限に達した場合も、取得できた範囲での最新時刻です。日時は Zabbix のユーザー設定（タイムゾーン・言語）で表示します。
- **Proxy との関連付け**: 関連付けの根拠は、Proxy の `additional_resource_attributes` に設定した属性だけです。signal type `traces` に、キー `holoztek.zabbix.proxyid`、値はその Proxy 自身の proxyid を設定してください。設定がない Proxy のテレメトリは表示しません。`host.name` や IP からの推測は行いません。
- **観測範囲**: 設定「OTel観測期間（分）」（5〜1440、既定は 15）の期間内に Span が確認された OTel Service・OTel System を表示します。期間を長くすると送信頻度の低いシステムも表示されます。この期間はリフレッシュ間隔とは独立で、APM が OFF のときは使いません。OTel Service・OTel System はそれぞれ最大 100 件まで表示します。Span が多く、表示から漏れた組み合わせがある可能性を否定できないときは、APM データストアのツールチップに「APM システムが多すぎるため、一部を表示していません。」と表示します。表示は観測の事実であり、現在受信中であることを示すものではありません。送信元が同じキーを自分で設定した場合は区別できません。

Backend components (Database / APM) are optional and off by default; while off, the widget behaves as before.

- **Database** (Zabbix 7.0+) adds a Zabbix DB node and one Proxy DB node per displayed Proxy. The database type comes from the Server, or from the Frontend configuration as a hint. Proxy database details are not available from the Zabbix API, so none are shown.
- **APM** (Zabbix 8.0+ only, ignored on 7.0) adds the Global Data Source as a ClickHouse node and shows APM-enabled Proxies, including those with no monitored Hosts. An enabled collector is a configuration state, not proof that telemetry is arriving.
- Only Super admins can read the Global Data Source. Other users see an abstract "APM Data Store" node when an APM-enabled Proxy exists. Credentials are never passed to the browser.
- The Global Data Source does not guarantee where a given Proxy actually writes: per-Proxy overrides are not available from the API.
- With APM on, telemetry observed through a Proxy is shown as a fixed Proxy → OTel Service → OTel System hierarchy (Zabbix 8.0+; up to 100 services and 100 systems; when there are too many spans to rule out a missed combination, the APM datastore tooltip says "Too many APM systems to display."). Services and systems are shown while they have a span within the "OTel observation window (minutes)" setting (5-1440, default 15); a longer window keeps low-frequency telemetry sources visible. The window is independent of the refresh interval and unused while APM is off. An OTel Service is labelled by the resource attribute `service.name` and an OTel System by `host.name` (case-sensitive). A service is identified by Proxy + `service.name` and a system by Proxy + `service.name` + `host.name`, so the same `host.name` under another service or Proxy is a separate node. Telemetry without `service.name` is not shown; without `host.name`, only the service is shown. OTel nodes are never merged with or linked to Zabbix Hosts. `service.namespace` and `deployment.environment` are supplementary: shown in the tooltip and matched by search, never used for identity. The link relies only on the Proxy's `additional_resource_attributes`: on signal type `traces`, set the key `holoztek.zabbix.proxyid` to that Proxy's own proxyid. Telemetry without it is not shown, and a Proxy is never inferred from `host.name` or an IP address.
- **Data acquisition vs. relation filter.** Database and APM under Backend components decide what is fetched at all: a component turned off is not fetched, and its relation cannot be chosen in the filter. The filter's Relations only show or hide what was fetched, and hiding them does not stop fetching (Info still shows the retrieval). The "Default relation visibility" setting (Display tab) is where the filter's Relations start when the dashboard is opened; relations not fetched cannot be chosen. Changes made in the filter are kept on refresh and dropped on a page reload (they are not saved); the filter's Reset also returns to the defaults. Existing widgets without this setting show every relation.
- **Performance.** With APM on, each update runs up to 3 queries against the APM trace API. The cost can grow with the senders' telemetry volume and the "OTel observation window (minutes)". The Info panel and Last observed are derived from the spans already fetched and add no queries.
- **Last observed** in the tooltip of an OTel Service or System is the latest span time among the spans this widget fetched: a system's own spans, and for a service, all its systems plus its spans without `host.name`. It is not when a user last used an agent, nor process uptime; a sender that emits background spans updates it without any user activity. If the fetch hit its limits, it is still the latest time within what was fetched. It is shown in the user's Zabbix time zone and language.
- Backend nodes are not affected by the Host filter, and Proxy highlighting follows monitoring edges only.
- The filter panel's Relations category shows or hides the Monitoring, Database, APM storage and Telemetry relations already loaded (Telemetry covers both the Proxy—service and service—system lines and the OTel nodes). A node stays visible while any shown relation connects it. The widget's Backend components setting decides what is loaded, and the Host filter works independently.

## OpenTelemetry Topology

Zabbix Proxy が受信した OpenTelemetry のテレメトリを、次の固定階層で表示します（Zabbix 8.0 以上、設定「バックエンド構成」の APM を ON）。

```text
Zabbix Server → APM Data Store (ClickHouse) → Zabbix Proxy
    → OpenTelemetry サービス (service.name) → OpenTelemetry システム (host.name)
```

- Proxy の APM 設定で、Resource attribute `holoztek.zabbix.proxyid`（Category: Traces）にその Proxy 自身の proxyid を設定します。
- 送信元は `service.name`（必須）と `host.name`（推奨）を Resource Attribute として送信します。
- OpenTelemetry システムは Zabbix の Host と統合しません。同じ名前の Host とシステムが並んで表示されるのは正常です。
- 「OTel観測期間（分）」内に Span が観測されたものだけを表示します。

設定手順・送信元ごとの注意・観測期間の選び方・トラブルシュートは [OpenTelemetry Topology 導入ガイド](docs/OTEL_TOPOLOGY_SETUP.ja.md) を参照してください。

Shows OpenTelemetry telemetry received by a Zabbix Proxy as a fixed hierarchy: Zabbix Server → APM Data Store (ClickHouse) → Zabbix Proxy → OpenTelemetry Service (`service.name`) → OpenTelemetry System (`host.name`). It needs Zabbix 8.0+ and APM turned on under Backend components.

- On the Proxy's APM tab, set the resource attribute `holoztek.zabbix.proxyid` (Category: Traces) to that Proxy's own proxyid.
- Senders send `service.name` (required) and `host.name` (recommended) as resource attributes.
- OpenTelemetry Systems are never merged with Zabbix Hosts, so a Host and a System with the same name shown side by side is expected.
- Only telemetry with a span within the "OTel observation window (minutes)" is shown.

For setup steps, sender notes, choosing the observation window and troubleshooting, see the [OpenTelemetry Topology Setup Guide](docs/OTEL_TOPOLOGY_SETUP.md).

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
