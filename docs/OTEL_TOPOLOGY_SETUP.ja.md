# APM監視 / OpenTelemetry Topology 導入・運用ガイド

[English](OTEL_TOPOLOGY_SETUP.md)

このガイドでは、Zabbix 8.0のAPM監視で収集済みのOpenTelemetryトレースから、Monitoring Topologyが収集経路を描画するための条件と運用上の確認点を説明します。

ZabbixのAPM監視とOpenTelemetry Collectorなどの送信経路は、すでに構成され、Zabbix上でトレースを確認できることを前提とします。APM監視そのものの設定手順は扱いません。

## 用語

| 用語 | このガイドでの意味 |
|---|---|
| APM監視 | OpenTelemetryトレースを受信・保存・参照するZabbix 8.0の機能です。 |
| OpenTelemetryトレース | APM監視に保存されたTraceとSpanです。Monitoring TopologyはSpanのResource Attributeをトポロジー判定に使用します。 |
| OTel Service | Resource Attributeの<code>service.name</code>から作成するサービスノードです。 |
| OTel System | Resource Attributeの<code>host.name</code>から作成する実行環境ノードです。 |
| Telemetry | ウィジェットの「関係」フィルタに表示される名称です。OpenTelemetryトレースから生成した関係を指します。 |

## バックエンドノードの意味

「バックエンド構成」を有効にすると、Monitoring Topologyは次の論理的な関係を追加します。

- データベース: <code>Zabbix Server → Zabbix DB</code>、<code>Zabbix Proxy → Proxy DB</code>
- APM監視: <code>Zabbix Server → APM Data Store → APM有効Zabbix Proxy</code>

APM Data Storeは、グローバルAPMデータソースを参照できる場合はClickHouseとして表示し、それ以外は汎用名で表示します。APM Data StoreとProxyの線は、APM Collectorが有効なProxyとグローバルAPMデータソースの関係を示します。Proxyが個別設定で別のデータソースを使用している可能性があるため、実際の書き込み先を保証する線ではありません。

## トポロジーモデル

APM監視の収集経路は、次のモデルで表示します。

<code>Zabbix Server → APM Data Store → APM有効Zabbix Proxy → OTel Service → OTel System</code>

このモデルは、トレースを受信したZabbix ProxyとSpanのResource Attributeから推定した論理的な収集経路です。アプリケーション間の呼び出し関係や、ネットワーク上の物理経路を表すものではありません。

OTel ServiceとOTel SystemはZabbix Hostとは別のノードです。同じ名称であっても自動的には統合しません。

## 描画に必要な条件

次の条件をすべて満たす必要があります。

| 条件 | 確認内容 |
|---|---|
| Zabbixバージョン | Zabbix Serverと対象Zabbix Proxyが8.0以降であること。 |
| APM監視 | OpenTelemetryトレースを受信し、ZabbixのAPM画面で対象Spanを確認できること。 |
| ProxyのAPM Collector | 対象Zabbix ProxyでAPM Collectorが有効であること。 |
| Proxy識別設定 | 対象Zabbix Proxyのトレース用追加Resource Attributeに<code>holoztek.zabbix.proxyid</code>があり、値がそのProxy自身の<code>proxyid</code>と一致すること。 |
| Proxy識別属性 | SpanのResource Attributeに<code>holoztek.zabbix.proxyid</code>があり、トレースを受信したZabbix Proxy自身の<code>proxyid</code>と一致すること。 |
| サービス名 | SpanのResource Attributeに空でない<code>service.name</code>があること。 |
| 対象指定 | ウィジェットに固定ホストグループ、または他ウィジェットから受信したホスト／ホストグループがあること。 |
| ウィジェット設定 | 「バックエンド構成」でAPMを有効にしていること。 |
| 観測期間 | 「OTel観測期間」内に条件を満たすSpanが保存されていること。 |

<code>host.name</code>は任意です。値がある場合だけOTel Systemを作成します。

Monitoring Topologyが参照するのはトレースのSpanです。MetricsやLogsだけを送信している場合は描画されません。

## 必要なResource Attribute

| Attribute | 必須 | 用途 |
|---|---:|---|
| <code>holoztek.zabbix.proxyid</code> | 必須 | Spanを受信したZabbix Proxyへ収集経路を関連付けます。値はZabbix API上のProxy IDと一致させます。 |
| <code>service.name</code> | 必須 | OTel Serviceの名称と識別に使用します。 |
| <code>host.name</code> | 任意 | OTel Systemの名称と識別に使用します。 |

属性値は、OpenTelemetry Collectorのresource processor、SDKのResource設定、または同等の仕組みで付与できます。具体的な付与方法は利用しているOpenTelemetry構成に合わせてください。

同じProxy配下の同一<code>service.name</code>は、1つのOTel Serviceへ集約されます。OTel SystemはProxy、Service、<code>host.name</code>の組み合わせで識別するため、同じ<code>host.name</code>でもServiceが異なれば別ノードです。環境や役割を分離して表示したい場合は、区別できる値を設定してください。

## ウィジェット設定

1. Monitoring Topologyの設定で「バックエンド構成」を開きます。
2. APMを有効にします。
3. 「OTel観測期間」を5〜1440分の範囲で設定します。
4. ウィジェットの自動リフレッシュは「更新なし」に設定します。

「関係」フィルタのTelemetryを無効にすると、OTel Service、OTel System、およびそれらへ接続するOpenTelemetry由来の関係を非表示にできます。

## 観測期間と取得上限

ウィジェットは設定した観測期間内のSpanを新しいものから取得します。

- 1回の取得上限: 500 Span
- 継続取得: 最大3回
- OTel Service: 最大100ノード
- OTel System: 最大100ノード

上限を超えた場合は、取得できたデータだけで描画し、ウィジェットに警告を表示します。短時間に大量のSpanが発生する環境では、観測期間を短くするか、Resource Attributeの粒度を見直してください。

## 表示されない場合の確認

次の順序で確認します。

1. ZabbixのAPM画面で、観測期間内の対象Spanを確認できるか。
2. 対象ProxyでAPM Collectorが有効か。
3. Proxyのトレース用追加Resource Attributeが<code>holoztek.zabbix.proxyid</code>をProxy自身の<code>proxyid</code>として付与する設定か。
4. Spanに<code>service.name</code>があるか。
5. Spanの<code>holoztek.zabbix.proxyid</code>が受信Proxyの<code>proxyid</code>と一致するか。
6. Monitoring TopologyでAPMが有効か。
7. 「関係」フィルタのTelemetryが有効か。
8. 固定対象または受信対象が設定されているか。
9. 取得上限の警告が表示されていないか。

OTel Serviceは表示されるがOTel Systemが表示されない場合は、Spanに<code>host.name</code>があるか確認してください。

## 制限事項

- APM監視のトレースデータだけを対象とし、MetricsとLogsは使用しません。
- Span間の親子関係やサービス間通信は描画しません。
- OTel Service／OTel SystemとZabbix Hostは自動統合しません。
- APM Data StoreとAPM有効ProxyはZabbixの設定情報から表示し、OTel Service／OTel Systemは取得したSpanから表示します。
- 観測期間外のSpanだけが存在するService／Systemは表示しません。
