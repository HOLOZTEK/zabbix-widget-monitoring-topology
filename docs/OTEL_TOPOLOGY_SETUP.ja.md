# APM監視 / OpenTelemetry Topology 導入・運用ガイド

[English](OTEL_TOPOLOGY_SETUP.md)

このガイドでは、Zabbix 8.0のAPM監視で収集済みのOpenTelemetryトレースから、Monitoring Topologyが論理的な収集関係を描画するための条件と運用上の確認点を説明します。

ZabbixのAPM監視と、OpenTelemetry送信元からZabbixへトレースを送信する経路は、すでに構成され、Zabbix上でトレースを確認できることを前提とします。APM監視そのものの設定手順は扱いません。

## 用語

| 用語 | このガイドでの意味 |
|---|---|
| APM監視 | OpenTelemetryトレースを受信・保存・参照するZabbix 8.0の機能です。 |
| OpenTelemetryトレース | APM監視に保存されたTraceとSpanです。Monitoring TopologyはSpanのResource Attributeをトポロジー判定に使用します。MetricsとLogsは使用しません。 |
| OpenTelemetryサービス | Resource Attributeの<code>service.name</code>から作成するサービスノードです。 |
| OpenTelemetryシステム | Resource Attributeの<code>host.name</code>から作成する実行環境ノードです。 |
| Telemetry | ウィジェットの「関係」フィルタに表示される名称です。OpenTelemetryトレースから生成した関係を指します。 |

## 論理的な表示構造と実際の通信方向

Monitoring Topologyでは、監視・収集関係を理解しやすくするため、次の論理階層で表示します。

<code>Zabbix Server → APM Data Store → APM有効Zabbix Proxy → OpenTelemetryサービス → OpenTelemetryシステム</code>

これは通信フロー図ではありません。実際のトレース送信方向は次のとおりです。

<code>OpenTelemetry送信元 → Zabbix Proxy / APM Collector → APM Data Store</code>

OpenTelemetry送信元には、アプリケーション、AI Agent、OpenTelemetry SDK、OpenTelemetry Collectorなどが含まれます。論理階層は、トレースを受信したZabbix ProxyとSpanのResource Attributeから構成します。アプリケーション間の呼び出し関係や物理ネットワーク経路は表しません。

APM Data Storeは、グローバルAPMデータソースを参照できる場合はClickHouseとして表示し、それ以外は汎用名で表示します。APM Data StoreとZabbix Proxyの線は、APM Collectorが有効なProxyとグローバルAPMデータソースの論理的な関係です。Proxyが個別設定で別のデータソースを使用している可能性があるため、実際の書き込み先を保証しません。

OpenTelemetryサービスとOpenTelemetryシステムはZabbix Hostとは別のノードです。同じ名称であっても自動的には統合しません。

## 描画に必要な条件

次の条件を満たす必要があります。

| 条件 | 確認内容 |
|---|---|
| ZabbixとProxy環境 | Zabbix Serverと対象Zabbix Proxyが8.0以降で、利用するOS向けにAPM対応Proxyパッケージが提供されていること。 |
| APM監視 | OpenTelemetryトレースを受信し、ZabbixのAPM画面で対象Spanを確認できること。 |
| 描画対象 | Monitoring Topologyの対象として、固定指定または他ウィジェットから受信したZabbix Hostが少なくとも1台あること。 |
| ProxyのAPM Collector | 対象Zabbix ProxyでAPM Collectorが有効であること。 |
| Proxy側設定 | Zabbix Proxyが受信Spanへ<code>holoztek.zabbix.proxyid</code>を追加し、値にそのProxy自身の<code>proxyid</code>を設定すること。対象はTracesです。 |
| Span側Proxy識別属性 | 保存されたSpanに<code>holoztek.zabbix.proxyid</code>が存在し、トレースを受信したProxyの<code>proxyid</code>と一致すること。 |
| サービス名 | Spanに空でない<code>service.name</code>があること。 |
| ウィジェット設定 | 「バックエンド構成」でAPMを有効にしていること。 |
| OTel観測期間 | 設定した期間内に条件を満たすSpanが保存されていること。 |

OpenTelemetryノードを表示するには少なくとも1台のZabbix Hostが必要ですが、選択したZabbix HostとOpenTelemetryシステムの<code>host.name</code>が一致する必要はありません。OpenTelemetryノードは、選択したHostとは独立してAPMデータから取得されます。

<code>host.name</code>は任意です。値がある場合だけOpenTelemetryシステムを作成します。MetricsやLogsだけを送信している場合は描画されません。

Zabbix 8.0のAPM対応Proxyパッケージが提供されていないEL9では、APM/OpenTelemetry表示を利用できません。これはAPM Proxy環境の制約であり、Monitoring Topology本体がEL9やZabbix 7.0に対応していないという意味ではありません。

## 必要なResource Attribute

| Attribute | 必須 | 用途 |
|---|---:|---|
| <code>holoztek.zabbix.proxyid</code> | 必須 | トレースを受信したZabbix Proxyと論理トポロジーを関連付ける表示用metadataです。 |
| <code>service.name</code> | 必須 | OpenTelemetryサービスの名称と識別に使用します。 |
| <code>host.name</code> | 任意 | OpenTelemetryシステムの名称と識別に使用します。 |

<code>service.name</code>と<code>host.name</code>は、OpenTelemetry送信元、SDKのResource設定、OpenTelemetry Collectorのresource processor、または同等の仕組みで付与できます。具体的な方法は利用しているOpenTelemetry構成に合わせてください。

同じProxy配下の同一<code>service.name</code>は、1つのOpenTelemetryサービスへ集約されます。OpenTelemetryシステムはProxy、Service、<code>host.name</code>の組み合わせで識別するため、同じ<code>host.name</code>でもServiceが異なれば別ノードです。

<code>holoztek.zabbix.proxyid</code>は認証情報、認可条件、セキュリティクレデンシャルではありません。送信元がResource Attributeを任意に設定できる環境では、実在するProxy IDを指定できる可能性があります。Proxy関連付け用の表示metadataとして扱ってください。送信元自身がこの属性を設定した場合の実環境での挙動は未検証です。

## ウィジェット設定

1. Monitoring Topology設定の「データ取得」タブを開きます。
2. 「バックエンド構成」でAPMを有効にします。
3. 「OTel観測期間」を5〜1440分の範囲で設定します。
4. 「フィルター」タブで、ダッシュボード上のフィルターの初期状態を設定します。
5. 必要に応じてリフレッシュ間隔を設定します。APMを有効にすると、リフレッシュ時にAPM Traceの取得が行われます。

データ取得と表示フィルターの役割は分かれています。APMを無効にするとSpanの取得自体を行いません。「構成要素」のOpenTelemetryを無効にすると、取得済みのOpenTelemetryサービス／システムと接続する線を非表示にしますが、取得は継続します。「関係」のTelemetryを無効にするとOpenTelemetry由来の線だけを非表示にし、ノードは残します。

「フィルター」タブは、ダッシュボードを開いたときの初期状態を設定します。ダッシュボード上で変更したフィルター状態は通常のリフレッシュ中は維持されますが、ブラウザには保存されません。ページの再読み込みまたは「リセット」で「フィルター」タブの値へ戻ります。フィルター操作ではデータを再取得せず、ノードも移動しません。

## 観測期間と取得上限

ウィジェットは、設定したOTel観測期間内のSpanを新しいものから取得します。

- 1回の取得上限: 500 Span
- 継続取得: 最大3回
- OpenTelemetryサービス: 最大100ノード
- OpenTelemetryシステム: 最大100ノード

上限を超えた場合は取得できたデータだけで描画し、ウィジェットに警告を表示します。観測期間を短くすると対象Span数が減り、表示漏れが改善する場合があります。ただし、大量のSpanを継続的に生成する環境では、観測期間を短くしても取得上限へ到達し、一部のサービス／システムを取得できない場合があります。

「情報」パネルでは、観測期間、取得したSpan数、クエリ数と上限、サービス／システム数、取得状態を確認できます。トポロジーの件数と凡例も表示します。これらはウィジェットが取得済みのデータから算出し、追加のクエリは行いません。

OpenTelemetryサービス／システムのツールチップには、ウィジェットが取得したSpanのうち最新の時刻を「最終観測」として表示します。プロセスの稼働状態や利用者が最後に操作した時刻ではありません。時刻は利用者のZabbixタイムゾーンで表示します。

## ユーザー権限と表示範囲

Monitoring Topologyは、現在のユーザーがZabbix APIから参照できる情報だけでトポロジーを構成し、Zabbixの権限制御を迂回しません。同じDashboardとWidget設定でも、ユーザーによって表示内容が異なる場合があります。

Zabbix 8.0では、非Super adminユーザーが対象Zabbix Proxyを参照するには、そのユーザーグループにProxyへのアクセス権が必要です。アクセス権がない場合、そのProxyと配下のOpenTelemetryサービス／システムは表示されません。そのProxyが監視するHostは、取得可能な情報だけで再構成され、<code>Zabbix Server → Unknown Network → Host</code>相当の経路で表示される場合があります。これはウィジェットの不具合ではありません。

また、<code>apm_filters</code>などのAPMアクセス制御により、ユーザーごとに参照可能なトレースが異なります。そのため、同一Dashboard・同一Widget設定でも、OpenTelemetryサービス／システムの表示数や内容が異なる場合があります。

## 表示されない場合の確認

次の順序で確認します。

1. Zabbix 8.0以降で、対象OS向けのAPM対応Proxy環境があるか。
2. Monitoring Topologyの描画対象としてZabbix Hostが少なくとも1台あるか。
3. 対象Zabbix ProxyでAPM Collectorが有効か。
4. 現在のユーザーに対象Proxyへのアクセス権があるか。
5. APM filterで対象トレースの参照が許可されているか。
6. Proxy側でTraces用の<code>holoztek.zabbix.proxyid</code>を付与しているか。
7. 保存Spanの<code>holoztek.zabbix.proxyid</code>が実際の受信Proxyと一致するか。
8. Spanに空でない<code>service.name</code>があるか。
9. SpanがOTel観測期間内にあるか。
10. データ取得のAPMと「構成要素」フィルタのOpenTelemetryが有効か。
11. 線だけが表示されない場合は、「関係」フィルタのTelemetryが有効か。
12. 「情報」パネルの取得状態と取得上限の警告を確認する。

OpenTelemetryサービスは表示されるがOpenTelemetryシステムが表示されない場合は、Spanに<code>host.name</code>があるか優先して確認してください。

## 検証環境と未試験項目

Zabbix 8.0.0正式版、Rocky Linux 10、PHP 8.4の環境でAPM/OpenTelemetry表示を確認しました。検証環境ではClickHouse 26.10でも動作しましたが、Zabbixが公式にサポートするClickHouseバージョン範囲外です。この結果を公式対応または互換性保証とは扱いません。

次の項目は実機未確認です。

- Zabbix 8.0の新規インストール環境
- Zabbix 8.0とUbuntuでのDEBパッケージ
- Zabbix 8.0でのProxy Group
- APM Proxyホスト上でのパッケージ、プロセス、ログの直接確認
- <code>service.name</code>または<code>host.name</code>が欠落した実トレース

属性欠落時のノード生成ロジックは合成テストデータで確認しており、実トレースでの検証結果ではありません。

## 制限事項

- APM監視のトレースデータだけを対象とし、MetricsとLogsは使用しません。
- 論理トポロジーはTelemetryの実通信方向を表しません。
- Span間の親子関係やサービス間通信は描画しません。
- OpenTelemetryサービス／システムとZabbix Hostは自動統合しません。
- APM Data StoreとAPM有効ProxyはZabbixの設定情報から表示し、OpenTelemetryサービス／システムは取得したSpanから表示します。
- 観測期間外のSpanだけが存在するサービス／システムは表示しません。
- 表示内容はZabbix APIとAPM filterによる現在のユーザーの参照範囲に制限されます。
- 構成要素／関係フィルターは表示だけを制御し、APMのデータ取得が有効な間は取得コストを減らしません。
- 「最終観測」はウィジェットが取得できたSpanの範囲に限られ、取得上限の影響を受ける場合があります。
