# zabbix-widget-monitoring-topology

[English](README.md) | 日本語

## 概要

Monitoring Topology は、Zabbix が監視しているホストへ至る監視経路をトポロジーとして可視化するダッシュボードウィジェットです。

固定指定した複数のホストグループ、またはナビゲータ等から受信したホスト／ホストグループを描画対象にできます。Server・Proxy・Proxy Groupの監視経路、並びにVMware仮想化とKubernetesクラスタの階層を可視化します。Zabbix 8.0では、APM監視で保存されたOpenTelemetryトレース（Span）の収集経路も表示できます。

グラフ描画には Vis Network の Canvas2D を使用しています。（WebGL は不要）

<a href="screenshots/monitoring-topology-dashboard-example.png" target="_blank"><img src="screenshots/monitoring-topology-dashboard-example.png" width="750" alt="Tree Navigator と連携した Monitoring Topology ダッシュボード" /></a>

[最新リリース](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/tag/v1.2.3) | [RPM](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.3/zabbix-widget-monitoring-topology-1.2.3.noarch.rpm) | [DEB](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.3/zabbix-widget-monitoring-topology_1.2.3_all.deb) | [Source](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.3/zabbix-widget-monitoring-topology-1.2.3.tar.gz)

## Monitoring Topology を使う理由

通常のダッシュボードではホスト状態を確認できますが、各ホストがどの Server／Proxy から監視されているかを一覧で把握することは容易ではありません。本ウィジェットは、Zabbix の設定・アイテム・ディスカバリ関係を基に監視経路をトポロジーとして描画することで、監視網全体を可視化すると同時に、監視経路の親子関係の把握を助けます。

監視対象のホスト数が多い環境または高度な分散監視を行う環境において、Server／Proxy とホストの対応、サブネット別の配置、VMware や Kubernetes の親子関係を運用者が俯瞰したい場合に適しています。

## 機能

<table>
  <tr><th align="left" nowrap>機能</th><th align="left">説明</th></tr>
  <tr><td nowrap>監視経路グラフ</td><td>Zabbix Server、Zabbix Proxy、Proxy Group、Network、Host を接続して表示します。</td></tr>
  <tr><td nowrap>ネットワーク表示</td><td>ホストのインターフェースIPと設定可能なIPv4プレフィックス長からNetworkノードを算出します。監視経路の描画を優先しているため、同一のネットワークが異なる経路で接続される場合には、同一のネットワークセグメントが複数ヶ所に描画される場合があります。</td></tr>
  <tr><td nowrap>VMware監視</td><td>公式VMwareテンプレートのディスカバリとアイテムから Datacenter → Cluster → ESXi Host の階層を構成し、VMをESXi Host配下のNetworkノード経由で表示します。</td></tr>
  <tr><td nowrap>Kubernetes監視</td><td>公式Kubernetesテンプレートのキーとディスカバリ関係を検出し、Network → 集約ホスト → Kubernetes Cluster → 構成要素ホストの階層を表示します。</td></tr>
  <tr><td nowrap>インターフェイスなしホスト</td><td>インターフェースを持たない監視ホストでは、接続先マクロからネットワークまたはラベルを判定して表示します。</td></tr>
  <tr><td nowrap>機器・監視方式表示</td><td>ホスト種別アイコンに対して、監視方式のバッジ（Ping、SNMP、Agent、IPMI、VMware、ODBC、JMX、Kubernetes 等）を表示します。</td></tr>
  <tr><td nowrap>障害状態の表示</td><td>ホストで検知されている障害の深刻度の色をアイコンの背景に表示します。複数の障害が発生している場合は、深刻度が最も高い障害の色が選択されます。</td></tr>
  <tr><td nowrap>表示フィルタ</td><td>障害状態、ホスト状態、インターフェース、監視経路、監視方式で表示内容の絞り込みを行います。</td></tr>
  <tr><td nowrap>描画対象の指定</td><td>複数のホストグループを固定指定するほか、ナビゲータからホスト／ホストグループを受信して動的に描画内容を変更できます。</td></tr>
  <tr><td nowrap>バックエンド構成</td><td>Zabbix DBとProxy DBを任意で表示します。</td></tr>
  <tr><td nowrap>APM監視</td><td>APM監視で保存されたOpenTelemetryトレースの収集経路を任意で表示します。</td></tr>
  <tr><td nowrap>表示状態の維持と操作ツール</td><td>差分更新時のノード位置を維持し、検索、全体表示、凡例、関係フィルタ、ドラッグ時の追従ホップ数設定を提供します。</td></tr>
  <tr><td nowrap>対話操作</td><td>ノードの移動とレイアウトの調整、ホストのメニューへのアクセスに対応します。</td></tr>
</table>

## トポロジーモデル

Monitoring Topology は、Zabbix Serverからの直接監視、Zabbix Proxy経由の分散監視、インターフェース情報、ディスカバリ関係、ホストマクロ、監視アイテムからトポロジーを構成します。実際の構造はZabbixで取得できるデータに依存します。

障害の深刻度はホストに対してのみ表示を行い、Server、Proxy、Proxy Group、ネットワーク、クラスタなどのグループに対しては表示しません。

描画が対応している主なモデルパターンは次のとおりです。

<table>
  <tr><th align="left" nowrap>パターン</th><th align="left">判定方法（代表的な経路を含む）</th><th align="left">参考画像</th></tr>
  <tr><td nowrap>ZabbixServer経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Network -&gt; Host</code><br>Zabbix Serverがホストを直接監視します。プライマリインターフェースと設定されたサブネットプレフィックスからNetworkノードを決定します。</td><td><a href="screenshots/monitoring-topology-zabbix-server.png" target="_blank"><img src="screenshots/monitoring-topology-zabbix-server.png" width="150" alt="ZabbixServer経由の監視経路"></a></td></tr>
  <tr><td nowrap>ZabbixProxy経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>単体のZabbix Proxyが割り当てられたホストを、そのProxyと算出したNetworkノードの配下に配置します。</td><td><a href="screenshots/monitoring-topology-zabbix-proxy.png" target="_blank"><img src="screenshots/monitoring-topology-zabbix-proxy.png" width="150" alt="ZabbixProxy経由の監視経路"></a></td></tr>
  <tr><td nowrap>Proxy Group経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Proxy Group -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>Proxy Group経由で監視するホストを、グループと監視経路に使われるメンバーProxyの配下に配置します。</td><td><a href="screenshots/monitoring-topology-proxy-group.png" target="_blank"><img src="screenshots/monitoring-topology-proxy-group.png" width="150" alt="Proxy Group経由の監視経路"></a></td></tr>
  <tr><td nowrap>VMware監視</td><td><strong>代表的な経路:</strong> <code>Server/Proxy -&gt; Network -&gt; VMware監視ホスト（Zabbix Host） -&gt; Datacenter -&gt; Cluster -&gt; ESXi Host -&gt; Network -&gt; VM</code><br>公式VMwareテンプレートのディスカバリと <code>vmware.hv.*</code> アイテムから、VMware監視ホストとインベントリ階層を構成します。VMは所属するvCenterとESXi Hostを識別し、ゲストのIPアドレスから算出したNetworkノードの配下へ配置します。</td><td><a href="screenshots/monitoring-topology-vmware.png" target="_blank"><img src="screenshots/monitoring-topology-vmware.png" width="150" alt="VMware監視の全体表示"></a></td></tr>
  <tr><td nowrap>Kubernetes監視</td><td><strong>代表的な経路:</strong> <code>Server/Proxy -&gt; Network -&gt; 集約ホスト（Zabbix Host） -&gt; Kubernetes Cluster -&gt; Kubernetes構成要素ホスト（Zabbix Host）</code><br>公式Kubernetesテンプレートのアイテムキーとディスカバリ親からクラスタを識別します。集約ホストをクラスタの親として自動取得し、API Server、Scheduler、Controller Manager、Kubeletなどの構成要素ホストをロール別に配置します。同じ経路上の複数クラスタも分離します。</td><td><a href="screenshots/monitoring-topology-kubernetes.png" target="_blank"><img src="screenshots/monitoring-topology-kubernetes.png" width="150" alt="Kubernetes監視の経路"></a></td></tr>
</table>

### ドラッグ時の追従ホップ数

ノードをドラッグするときに、接続関係を何段階先までレイアウト調整へ追従させるかを0〜10ホップで指定します。既定値は3です。ドラッグしたノードから指定ホップ数以内にあるノードだけが一時的に物理レイアウトの対象となり、その範囲外のノードは位置を維持します。

0を指定した場合はドラッグしたノードだけを移動します。過去に手動配置したノードは追従対象から除外され、配置した位置を維持します。ドラッグ終了後は周辺レイアウトが整った時点で物理演算を停止し、調整後の位置を維持します。

## バックエンド構成

バックエンド構成は任意で、既定では無効です。Zabbix ServerとZabbix Proxyが使用するデータベースを論理的なバックエンドとして表示します。

- `Zabbix Server → Zabbix DB`
- `Zabbix Proxy → Proxy DB`

Zabbix ServerのDB種別は、最初にServerの実行時DBバージョン情報から判定します。MySQL、MariaDB、PostgreSQLのいずれかを確認できた場合は、その種別を確定情報として表示します。実行時情報から判定できない場合は、Zabbixフロントエンドの接続設定を補助情報として参照し、MySQLまたはPostgreSQLを推定情報として表示します。どちらからも判定できない場合は、種別を付けずに「Zabbix DB」と表示します。

Zabbix ProxyのDB種別はZabbix APIから取得できないため推測せず、種別を付けずに「Proxy DB」と表示します。DBノードのツールチップでは、種別を取得できた場合に判定元も表示します。

<a href="screenshots/monitoring-topology-backend-database.png" target="_blank"><img src="screenshots/monitoring-topology-backend-database.png" width="750" alt="Zabbix Server と Zabbix Proxy のデータベース構成"></a>

## APM監視

APM監視のトポロジー表示は任意で、既定では無効です。Zabbix 8.0以降のAPM監視で保存されたOpenTelemetryトレースから、次の論理的な表示構造を構成します。

`Zabbix Server → APM Data Store → APM有効Zabbix Proxy → OpenTelemetryサービス（service.name）→ OpenTelemetryシステム（host.name）`

これはTelemetryの通信方向を示すものではありません。実際のトレースは、OpenTelemetry送信元からZabbix Proxy／APM Collectorを経由してAPM Data Storeへ保存されます。

APM Data Storeは、グローバルAPMデータソースを参照できる場合はClickHouseとして表示し、それ以外は汎用名で表示します。APM Data StoreとProxyの関係は、APM Collectorが有効なProxyとグローバルAPMデータソースの関係を示すもので、Proxyごとの実際の書き込み先を保証するものではありません。

OpenTelemetryノードを表示するには、Monitoring Topologyの描画対象として少なくとも1台のZabbix Hostと、使用するOS向けのAPM対応Proxy環境が必要です。選択したZabbix HostとOpenTelemetryシステムの<code>host.name</code>が一致する必要はありません。Zabbix 8.0のAPM対応Proxyパッケージが提供されていないEL9ではAPM/OpenTelemetry表示を利用できませんが、これはMonitoring Topology本体の対応OSを制限するものではありません。

<a href="screenshots/monitoring-topology-apm-opentelemetry.png" target="_blank"><img src="screenshots/monitoring-topology-apm-opentelemetry.png" width="750" alt="APM監視と OpenTelemetry の論理表示構造"></a>

詳細な設定、権限制御、取得上限、制約、トラブルシュートは[APM監視 / OpenTelemetry Topology 導入・運用ガイド](docs/OTEL_TOPOLOGY_SETUP.ja.md)を参照してください。

## 表示フィルタ

フィルタパネルは、グラフに残すHostノードを絞り込みます。ホストに関する同じカテゴリ内の選択肢はOR、5つのホストカテゴリ間はANDで組み合わせます。独立した「関係」カテゴリでは、監視経路、データベース、APMストレージ、およびOpenTelemetryトレースから生成した関係（画面上の「Telemetry」）を制御します。表示対象の子孫Hostへ至る上位ノードとエッジは表示を維持し、経路が分断されないようにします。

<table>
        <tr><th align="left" nowrap>カテゴリ</th><th align="left">選択肢</th><th align="left">用途と既定状態</th></tr>
        <tr><td nowrap>障害状態</td><td>未確認、確認済み、障害なし、メンテナンス中を含む、深刻度で色分け表示</td><td>メンテナンス中でないHostを障害状態で絞り込みます。未確認、確認済み、障害なしは既定でONです。「メンテナンス中を含む」は独立した表示条件で既定OFF、「深刻度で色分け表示」は表示可否に影響しない色分け設定で既定ONです。</td></tr>
        <tr><td nowrap>ホスト状態</td><td>通常ホスト、インターフェイス設定なし、ローカルホスト監視、無効ホスト</td><td>設定・運用状態でHostを排他的に分類します。既定では通常ホストだけがONです。</td></tr>
        <tr><td nowrap>インターフェイス</td><td>正常、一部監視不可、監視不可、状況不明</td><td>インターフェースの可用性でHostを絞り込みます。既定ではすべてONです。</td></tr>
        <tr><td nowrap>監視経路</td><td>Zabbix Server、Zabbix Proxy、Proxy Group</td><td>上流の監視経路でHostを絞り込みます。既定ではすべてONです。</td></tr>
        <tr><td nowrap>監視方式</td><td>Ping、Zabbix Agent、SNMP、IPMI、JMX、その他</td><td>検出した監視方式でHostを絞り込みます。既定ではすべてONです。「その他」にはVMware、ODBC、Kubernetes、個別分類できない方式を含みます。</td></tr>
        <tr><td nowrap>関係</td><td>監視経路、データベース、APMストレージ、Telemetry</td><td>取得済みの関係とバックエンドノードを表示・非表示にします。TelemetryはOpenTelemetryトレースから生成したOpenTelemetryサービス／OpenTelemetryシステムの関係です。利用可能な関係は既定ですべてONです。</td></tr>
</table>

<a href="screenshots/monitoring-topology-filters.png" target="_blank"><img src="screenshots/monitoring-topology-filters.png" height="395" alt="Monitoring Topology の表示フィルタパネル"></a>

表示条件となる選択肢をカテゴリ内ですべてOFFにすると、すべてのHostが非表示になります。「深刻度で色分け表示」は表示可否には影響しません。フィルタ状態はウィジェットごとにブラウザへ保存され、「リセット」で上記の既定状態へ戻ります。

## 設定項目

<table>
  <tr><th align="left" nowrap>項目</th><th align="left">説明</th></tr>
  <tr><td nowrap>ホスト</td><td>ナビゲータ等と接続する受信専用コネクタです。</td></tr>
  <tr><td nowrap>ホストグループ</td><td>サブグループを含む複数のホストグループを固定指定するか、他ウィジェットからホストグループを受信します。</td></tr>
  <tr><td nowrap>サブネットプレフィックス長</td><td>Networkノード算出用のIPv4プレフィックス。既定値は24です。</td></tr>
  <tr><td nowrap>Zabbix Serverラベル</td><td>ルートServerノードに表示する名称です。</td></tr>
  <tr><td nowrap>フォントサイズ</td><td>8〜24pxのノードラベルサイズです。</td></tr>
  <tr><td nowrap>スタイル</td><td>通常、太字、斜体から選択します。</td></tr>
  <tr><td nowrap>フォント色</td><td>空欄ではライト／ダークテーマを自動判定し、指定時はその色を使用します。</td></tr>
  <tr><td nowrap>エッジ色</td><td>ノード間を結ぶ線の色です。</td></tr>
  <tr><td nowrap>エッジ幅</td><td>1〜8pxの線幅です。</td></tr>
  <tr><td nowrap>ドラッグ時の追従ホップ数</td><td>ドラッグしたノードに追従する接続範囲を0〜10で指定します。既定値は3です。</td></tr>
  <tr><td nowrap>フィルタアイコン位置</td><td>左上、右上、左下、右下から選択します。</td></tr>
  <tr><td nowrap>バックエンド構成</td><td>データベース構成とAPM監視の収集経路を任意で有効にします。APM監視のトポロジー表示にはZabbix 8.0以降が必要です。</td></tr>
  <tr><td nowrap>OTel観測期間（分）</td><td>APM監視に保存されたOpenTelemetryのSpanを観測対象とする期間を5〜1440分で指定します。既定値は15です。</td></tr>
</table>

<a href="screenshots/monitoring-topology-settings-ja.png" target="_blank"><img src="screenshots/monitoring-topology-settings-ja.png" width="620" alt="Monitoring Topology ウィジェットの日本語設定画面"></a>

## 描画対象の指定とダッシュボード連携

設定画面でホストグループを複数固定指定すると、本ウィジェットを単独で使用できます。指定したグループのサブグループに属するホストも対象です。

動的に対象を変更する場合は、ホストまたはホストグループをナビゲータ等へ接続します。ホストは受信専用です。ホストグループは固定指定と他ウィジェットからの受信のどちらにも対応します。固定ホストグループと受信したホストを同時に指定した場合は、両方の和集合を表示します。固定対象も受信対象もない場合は空状態を表示します。

1. `_hostid` または `_hostgroupid` を配信するナビゲーターを配置します。
2. 同じページへ Monitoring Topology を追加します。
3. Monitoring Topology のリフレッシュ間隔を「リフレッシュなし」に設定します。
4. 設定画面でホスト／ホストグループを送信元ウィジェットへ接続します。
5. ホスト選択時はそのホストの経路、ホストグループ選択時はグループ内ホストの経路を表示します。

## 動作要件

- Zabbix 7.0 または 8.0
- PHP 8.1 以上
- RPM パッケージ: RHEL 互換 9／10
- Zabbix フロントエンドがサポートするブラウザ

## インストール

### RPM

```bash
dnf install ./zabbix-widget-monitoring-topology-1.2.3.noarch.rpm
```

### DEB

```bash
apt install ./zabbix-widget-monitoring-topology_1.2.3_all.deb
```

パッケージは実行ファイルを利用中のZabbixフロントエンドモジュールディレクトリへ配置します。その後、管理 → モジュールで再スキャンして有効化し、ダッシュボードへ追加してください。

### ソースから

通常はRPMまたはDEBを推奨します。ソースから配置する場合:

```bash
curl -L -o zabbix-widget-monitoring-topology-1.2.3.tar.gz https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.2.3/zabbix-widget-monitoring-topology-1.2.3.tar.gz
tar -xzf zabbix-widget-monitoring-topology-1.2.3.tar.gz
install -d /usr/share/zabbix/ui/modules/holoztek_monitoringmap
cd zabbix-widget-monitoring-topology-1.2.3
cp -a manifest.json Module.php Widget.php actions assets includes locale views /usr/share/zabbix/ui/modules/holoztek_monitoringmap/
```

GitHub Releasesで配布する正式なSourceパッケージには、実行時に必要な `assets/js/vis-network.min.js` が含まれます。GitHubが自動生成するソースコードアーカイブではなく、Release Assetsの `zabbix-widget-monitoring-topology-1.2.3.tar.gz` を使用してください。Zabbixフロントエンドが読める所有者・権限を設定し、モジュールを再スキャンして有効化してください。

## ドキュメント

- [変更履歴](docs/CHANGELOG.md)
- [コントリビューション](docs/CONTRIBUTING.md)
- [セキュリティ](docs/SECURITY.md)
- [スクリーンショットガイド](docs/screenshot-guide.md)
- [APM監視 / OpenTelemetry Topology 導入・運用ガイド](docs/OTEL_TOPOLOGY_SETUP.ja.md)
- [ライセンス](LICENSE)

## リポジトリ構成

実行時ファイルはルートと `actions/`、`assets/`、`includes/`、`locale/`、`views/` に配置しています。パッケージ定義は `packaging/rpm/` と `debian/`、公開・保守文書は `docs/` に分離しています。

## 同梱依存ライブラリ

`assets/js/vis-network.min.js` は Vis Network 10.1.0 です。ファイルヘッダーに記載されたMITまたはApache-2.0ライセンスで配布されています。

## メンテナー

[HOLOZTEK](https://github.com/HOLOZTEK) が開発・保守しています。

## ライセンス

MIT Licenseです。詳細は [LICENSE](LICENSE) を参照してください。
