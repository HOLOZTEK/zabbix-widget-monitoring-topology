# OpenTelemetry Topology 導入・運用ガイド

[English](OTEL_TOPOLOGY_SETUP.md) | 日本語

Monitoring Topology ウィジェットで OpenTelemetry（OTel）のテレメトリを表示するための設定と、表示結果の読み方をまとめたガイドです。概要は [README](../README.md) を参照してください。

対象: Monitoring Topology v1.2.3 以降、Zabbix 8.0 以上。

## 目次

1. [このTopologyが表すもの](#1-このtopologyが表すもの)
2. [OpenTelemetry Topology モデル](#2-opentelemetry-topology-モデル)
3. [前提条件](#3-前提条件)
4. [必須 Resource Attributes](#4-必須-resource-attributes)
5. [Zabbix Proxy の設定](#5-zabbix-proxy-の設定)
6. [送信元（AI Agent / OTel sender）の設定](#6-送信元ai-agent--otel-senderの設定)
7. [実機で確認した送信元ごとの挙動](#7-実機で確認した送信元ごとの挙動)
8. [ウィジェットの設定](#8-ウィジェットの設定)
9. [OTel観測期間](#9-otel観測期間)
10. [取得上限と取りこぼし](#10-取得上限と取りこぼし)
11. [表示例](#11-表示例)
12. [画面の操作](#12-画面の操作)
13. [トラブルシュート](#13-トラブルシュート)
14. [既知の制約](#14-既知の制約)

## 1. このTopologyが表すもの

Monitoring Topology は、ネットワークの物理的なつながりを描く図ではありません。**Zabbix から見た監視経路とテレメトリ収集経路**を描く図です。

そのため、同じ実機が次の 2 つのノードとして同時に表示されることがあります。これは正常な表示です。

```text
Zabbix Host: claude-node01            （Zabbix が監視している Host）
OpenTelemetry システム: claude-node01  （Proxy 経由でテレメトリを送ってきた System）
```

ウィジェットはこの 2 つを名前が同じでも自動で統合せず、線でも結びません。

## 2. OpenTelemetry Topology モデル

OpenTelemetry のテレメトリは、次の固定された階層で表示します。

```text
Zabbix Server
    |
APM データストア（ClickHouse）
    |
Zabbix Proxy
    |
OpenTelemetry サービス（service.name）
    |
OpenTelemetry システム（host.name）
```

APM データストアは、Super admin が閲覧し、Zabbix にグローバル APM データソースが設定されている場合に「ClickHouse」と表示されます。それ以外の場合は「APM データストア」と表示されます。

具体例:

```text
Zabbix Proxy
 ├─ codex-app-server
 │    ├─ codex-node01
 │    ├─ codex-node02
 │    └─ codex-node03
 │
 └─ claude-code
      ├─ claude-node01
      └─ claude-node02
```

本ガイドでは、OpenTelemetry サービスを「OTel Service」、OpenTelemetry システムを「OTel System」と略して書くことがあります。

## 3. 前提条件

OTel のノードを表示するには、次のすべてが必要です。

| 項目 | 内容 |
|---|---|
| Zabbix | 8.0 以上（7.0 では APM の設定は無視されます） |
| APM データの保存 | Zabbix の APM が構成され、Span（トレース）が記録されていること |
| Zabbix Proxy | APM の「Data collection enabled」が有効で、`holoztek.zabbix.proxyid` 属性が設定されていること（[5 章](#5-zabbix-proxy-の設定)） |
| 送信元 | `service.name`（必須）と `host.name`（推奨）を付けてトレースを Proxy へ送っていること（[6 章](#6-送信元ai-agent--otel-senderの設定)） |
| ウィジェット | 「バックエンド構成」で APM が ON で、表示対象（ホストグループまたは連携）が指定され、ホストが 1 台以上表示されていること（[8 章](#8-ウィジェットの設定)） |

注意:

- 使うのは**トレース（Span）だけ**です。メトリクスやログしか送っていない送信元は表示されません。
- OTel のノードは、表示対象のホストが通る経路とは無関係に、条件を満たすすべての Proxy の配下に表示されます。

## 4. 必須 Resource Attributes

| Attribute | 設定場所 | 用途 |
|---|---|---|
| `holoztek.zabbix.proxyid` | Zabbix Proxy（APM の Resource attributes） | テレメトリを受信した Proxy を確定する |
| `service.name` | OTel 送信元 | OpenTelemetry サービスの階層を作る |
| `host.name` | OTel 送信元 | OpenTelemetry システムのノードを作る |

値の扱い:

- 大文字と小文字は区別します（`Codex-node01` と `codex-node01` は別のノードです）。
- 前後の空白は取り除きます。空白だけの値は設定されていないものとして扱います。
- 表示に使うのは先頭 128 文字までです。
- `service.namespace` と `deployment.environment` は補足情報です。ツールチップに表示し、検索の対象にもなりますが、ノードを区別するためには使いません。
- これ以外の Resource Attributes はブラウザへ送りません。

## 5. Zabbix Proxy の設定

### 5.1 Proxy ID の確認

`holoztek.zabbix.proxyid` には、その Proxy **自身の** `proxyid` を設定します。`proxyid` は次のどちらかの方法で確認できます。

**Web UI**

1. **Administration → Proxies** を開きます。
2. 一覧にある Proxy 名のリンク先 URL（`zabbix.php?action=popup&popup=proxy.edit&proxyid=<数値>`）に含まれる `proxyid` の値を確認します。

**Zabbix API**

```json
{
  "jsonrpc": "2.0",
  "method": "proxy.get",
  "params": {
    "output": ["proxyid", "name"],
    "filter": {"name": ["proxy01"]}
  },
  "id": 1
}
```

結果の `proxyid` を使います。データベースを直接参照する必要はありません。

### 5.2 APM の設定

**Administration → Proxies** で対象の Proxy を開き、**APM** タブで次のように設定します。

| 項目 | 設定 |
|---|---|
| Data collection enabled | ON |
| Resource attributes（Process） | Key: `holoztek.zabbix.proxyid`、Value: その Proxy の `proxyid`、Category: `Traces` |

例（`proxyid` が 1 の場合。実際の値は各 Proxy のものを使います）:

```text
holoztek.zabbix.proxyid=1   （Category: Traces）
```

Proxy で OpenTelemetry データの受信を有効にするには、この画面の設定とは別に、Proxy の設定ファイルも構成しておく必要があります（画面のヘルプにも記載されています）。設定ファイルの手順は Zabbix 8.0 の公式ドキュメントに従ってください。

Proxy が複数ある場合は、Proxy ごとに、その Proxy 自身の `proxyid` を設定します。

次のいずれかに当てはまる Proxy のテレメトリは表示しません。

- 属性がない
- Category が `Traces` 以外になっている
- 値が自身の `proxyid` と一致しない

その場合も、APM が有効な Proxy のノード自体は表示します。

### 5.3 Proxy の属性が必須である理由

Monitoring Topology は、`host.name`、`service.name`、IP アドレスなどから、テレメトリを受信した Proxy を推測しません。関連付けるのは次の条件が成り立つ場合だけです。

```text
Span の holoztek.zabbix.proxyid == その属性を設定した Zabbix Proxy の proxyid
```

推測で結ぶと、名前の一致や NAT などによって誤った経路を描くことがあるためです。

### 5.4 セキュリティ上の注意

`holoztek.zabbix.proxyid` は認証情報ではありません。送信元が実在する `proxyid` を自分で設定した場合、Topology 上では区別できません。この属性は送信元では設定せず、Proxy 側だけで設定してください。

## 6. 送信元（AI Agent / OTel sender）の設定

AI Agent などの送信元が、ウィジェットに必要な Resource Attributes を自動で設定するとは限りません。送信元ごとに確認して設定してください。

### 6.1 一般原則

送信元ごとに、少なくとも次の 2 つを明示的に設定します。

```text
service.name = codex-app-server
host.name    = codex-node01
```

### 6.2 service.name

`service.name` は、OpenTelemetry サービスの階層を表す、変わらない論理名です。

```text
service.name = codex-app-server
service.name = claude-code
service.name = gemini-cli
```

同じ Service に複数の System からテレメトリが送られても問題ありません。

### 6.3 host.name

`host.name` は、テレメトリを送っている System を見分けるための名前です。OS のホスト名か、組織内で一意な Agent ノード名を推奨します。

```text
host.name = codex-node01
host.name = claude-node01
host.name = gemini-node01
```

### 6.4 service.name と host.name の役割

```text
service.name → 「何の Service か」
host.name    → 「どの System から来たか」
```

```text
service.name = codex-app-server
host.name    = codex-node01 / codex-node02 / codex-node03

codex-app-server
 ├─ codex-node01
 ├─ codex-node02
 └─ codex-node03
```

### 6.5 属性が足りない場合

| service.name | host.name | 表示 |
|---|---|---|
| あり | あり | Proxy → Service → System |
| あり | なし | Proxy → Service（System のノードは作りません） |
| なし | あり | 表示しません（`host.name` を Proxy へ直接つなぐことはしません） |
| なし | なし | 表示しません |

### 6.6 環境変数による設定

OpenTelemetry SDK を使う送信元では、OpenTelemetry 標準の環境変数で Resource Attributes を設定できる場合があります。

```bash
export OTEL_SERVICE_NAME="codex-app-server"
export OTEL_RESOURCE_ATTRIBUTES="host.name=codex-node01"
```

ただし、どの設定方法に対応しているかは送信元の実装によって異なります。環境変数を読まない送信元もあれば、独自の設定項目を持つ送信元もあります。**実際に使う送信元のドキュメントで、対応している設定方法を確認してください。** 設定後は、Zabbix の **APM → Traces** で Span の Resource attributes に `service.name` と `host.name` が付いているかを確認できます。

## 7. 実機で確認した送信元ごとの挙動

この章は、検証環境（Zabbix 8.0.0rc3、2026 年 11 月）で確認した事例です。ウィジェットの機能は特定の製品に依存せず、一般的な OpenTelemetry の送信元を対象にしています。ここに挙げる挙動は送信元のバージョン、設定、テレメトリの実装によって変わることがあります。

### 7.1 Codex（codex-app-server）

設定例:

```text
service.name = codex-app-server
host.name    = codex-node01
```

Codex app-server は、ユーザーが操作していないときでも、`auth`、`fs.read_file`、`fs.get_metadata`、`list_models` などの内部処理の Span を継続して送る場合があります。検証環境では、3 台の System のどれも、1 時間のうち Span の間隔が最長で約 4.5 分でした。

そのため、**操作していない Codex も、OTel観測期間（既定 15 分）のあいだは常に表示され続けることがあります。** これは異常ではありません。

### 7.2 Claude Code

検証環境では、Claude Code の Span は主に `claude_code.interaction`、`claude_code.llm_request`、`claude_code.tool` など、操作に伴うものでした。操作していない間は Codex のような継続的な Span が見られず、1 時間のうちに約 51 分 Span が途切れた System もありました。

この場合は次のような流れで表示から消えます。

```text
最後のテレメトリ
   ↓
OTel観測期間が経過
   ↓
Topology から消える
```

ただし、Claude Code が必ずこの挙動になるわけではありません。バージョン、設定、テレメトリの実装によって変わることがあります。

### 7.3 ウィジェットが判定していること

ウィジェットが判定しているのは「ユーザーが最近 Agent を操作したか」ではありません。判定しているのは **「設定した観測期間内にテレメトリ（Span）があるか」** だけです。表示されているかどうかは、Agent へのログイン状態、プロセスが動いているかどうか、ユーザーの操作時刻を直接示すものではありません。

## 8. ウィジェットの設定

| 設定 | 内容 |
|---|---|
| ホストグループ / ホスト | 表示対象。ホストが 1 台も表示されない状態では、OTel のノードも表示されません |
| バックエンド構成 → APM | ON にすると、APM データストア、APM 有効 Proxy、OTel のノードを取得して表示します（Zabbix 8.0 以上） |
| OTel観測期間（分） | 表示の対象にする期間。既定 15、範囲 5〜1440（[9 章](#9-otel観測期間)） |

## 9. OTel観測期間

設定名: 「OTel観測期間（分）」（英語 UI では "OTel observation window (minutes)"）

| 項目 | 値 |
|---|---|
| 既定 | 15 |
| 範囲 | 5〜1440 |
| 空欄 | 15 として保存 |

### 9.1 意味

```text
現在時刻 − OTel観測期間
        ↓
この期間内に Span がある
        ↓
Topology に表示する
```

この期間は、ウィジェットのリフレッシュ間隔とは関係ありません。APM が OFF のときは使いません。期間を変えた場合は、表示中のノードの位置を保ったまま、期間に入ったノードを追加し、外れたノードを取り除きます。

### 9.2 目安

どの環境にも合う値はありません。送信元がどのくらいの頻度でテレメトリを送るかに合わせて選んでください。

| 期間 | 向いている環境 |
|---|---|
| 5〜15 分 | テレメトリを高い頻度で送る環境 |
| 30〜60 分 | 定期的にしかテレメトリを送らない環境 |
| 数時間（最大 1440 分） | 低頻度の処理やバッチ型のテレメトリ |

### 9.3 長い期間の注意

期間を長くすると、次のようになります。

- 古い System も長く表示されます。
- 対象になる Span が増えます。
- 取得上限による取りこぼしが起きやすくなります（[10 章](#10-取得上限と取りこぼし)）。

## 10. 取得上限と取りこぼし

### 10.1 現在の上限

| 項目 | 上限 |
|---|---|
| Span の取得 | 1 回 500 件 × 最大 3 回 |
| OpenTelemetry サービス | 最大 100 件 |
| OpenTelemetry システム | 最大 100 件 |

Span は新しい順に、最大 3 回に分けて取得します。どの回も「観測期間内」「`holoztek.zabbix.proxyid` が対象 Proxy のもの」「`service.name` があり空でない」を共通の条件とします。

1. 共通の条件のみ（既出値の除外なし）。500 件未満ならここで取得を終えます
2. 1 回目に出なかった Service
3. それまでに出なかった `host.name`（`host.name` があるものに限る）

`service.name` のない Span は共通の条件で除外するので、上限を使いません。

### 10.2 取りこぼしが起きる仕組み

期間が長い場合や送信元が多い場合は、大量の Span を送る Service が取得枠を占めてしまいます。そのため、頻度の低い Service や System まで取得が届かないことがあります。その場合は、期間内にテレメトリがあっても Topology に表示されないことがあります。

例: 1 回目の 500 件がすべて頻度の高い Service の Span で埋まり、すでに出た Service と `host.name` の別の組み合わせ（例: Service A × System Y）が後ろに残る場合です。

### 10.3 警告の表示

次の場合は、APM データストアのツールチップに次の文言を表示します。

- 取得上限のために一部が表示から漏れた可能性を否定できない場合
- Service または System が 100 件を超えた場合

> APM システムが多すぎるため、一部を表示していません。
> （英語 UI: "Too many APM systems to display."）

ウィジェットは、上限の範囲内で全組み合わせを確認できたときだけ警告を出しません。

### 10.4 警告が出たときの対処

1. **まず OTel観測期間を短くします。** 対象の Span が減り、取得枠に収まりやすくなります。
2. それでも警告が消えない場合は、短い期間でも 1 回目の取得（500 件）が埋まるほど Span が多い環境です。この場合、警告はほぼ常に表示されます。見つからない Service や System があれば、Zabbix の **APM → Traces** で `service.name` や `host.name` を指定して、期間内に Span があるかを確認してください。

## 11. 表示例

### 11.1 基本

```text
service.name            = codex-app-server
host.name               = codex-node01
holoztek.zabbix.proxyid = 1   （Proxy 側で付与。1 は例示値）
```

```text
proxy01（proxyid 1）
   |
codex-app-server
   |
 codex-node01
```

### 11.2 1 つの Service に複数の System

```text
Proxy
  |
codex-app-server
 ├─ codex-node01
 ├─ codex-node02
 └─ codex-node03
```

### 11.3 複数の Service

```text
Proxy
 ├─ codex-app-server
 │   ├─ codex-node01
 │   └─ codex-node02
 │
 └─ claude-code
     ├─ claude-node01
     └─ claude-node02
```

### 11.4 同じ host.name で Service が異なる

Service が異なれば、同じ `host.name` でも別の経路として表示します。これは正常な表示です。

```text
service-a          service-b
   |                  |
 host01             host01
```

### 11.5 同じ host.name で Proxy が異なる

同じ System が複数の Proxy 経由で観測された場合も、別の経路として表示します。Monitoring Topology では、実体が同じかどうかよりも監視経路を優先します。

### 11.6 Zabbix Host と OpenTelemetry システムの同時表示

[1 章](#1-このtopologyが表すもの)のとおり、`Zabbix Host: claude-node01` と `OpenTelemetry システム: claude-node01` が同時に表示されるのは正常です。

## 12. 画面の操作

| 操作 | 内容 |
|---|---|
| APM（ウィジェット設定） | データの取得と Topology の構築そのものを制御します。OFF にすると Span を取得しません |
| 関係フィルター → Telemetry | 取得済みの Topology の**表示だけ**を制御します。OFF にすると、OpenTelemetry サービス、OpenTelemetry システム、Proxy—Service の線、Service—System の線を隠します |
| OTel観測期間 | 表示の対象にする期間（[9 章](#9-otel観測期間)） |
| 検索 | 表示中のノードを部分一致で探します。OpenTelemetry サービスは `service.name`、OpenTelemetry システムは `host.name` で見つかります。どちらも名前空間と環境でも見つかり、システムは所属する Service 名でも見つかります。フィルターで隠したノードは候補になりません |
| 凡例 | 現在の図にある関係の線種とノード種別を表示します（テレメトリは一点鎖線、サービス所属は二点鎖線） |
| 全体を表示 | フィルターで表示中のノードがすべて画面に収まるようにします |

ツールチップには次の情報が表示されます。

| ノード | 表示内容 |
|---|---|
| OpenTelemetry サービス | 種別、Service 名、System 数 |
| OpenTelemetry システム | 種別、Host（`host.name`）、Service 名 |
| APM 有効 Proxy | 観測されたテレメトリシステム数 |

## 13. トラブルシュート

### 13.1 Service が表示されない

次の順に確認してください。

1. Zabbix 8.0 以上か
2. ウィジェット設定の「バックエンド構成」で APM が ON か
3. ウィジェットの表示対象が指定され、ホストが 1 台以上表示されているか
4. Zabbix の APM が構成され、Span が保存されているか（**APM → Traces** で確認できます）
5. 対象の Proxy で「Data collection enabled」が ON か
6. 対象の Proxy に `holoztek.zabbix.proxyid` が Category `Traces` で設定され、値がその Proxy 自身の `proxyid` か
7. Span に `service.name` があるか
8. OTel観測期間内に Span があるか
9. 関係フィルターで Telemetry が OFF になっていないか
10. 送っているのがトレースか（メトリクスとログは対象外です）

### 13.2 Service は表示されるが System が表示されない

まず、Span の Resource Attributes に `host.name` があるかを確認してください。`service.name` だけでは System のノードは作りません。

### 13.3 System が突然消えた

最も多い原因は、OTel観測期間が経過したことです。**APM → Traces** で、その `service.name` と `host.name` の最後の Span の時刻を確認してください。送信の頻度が低い場合は期間を長くしてください（[9.2](#92-目安)）。

### 13.4 操作していない Agent が表示され続ける

異常とは限りません。Agent 自身がバックグラウンドのトレース（定期的な処理、認証の確認、内部処理など）を送り続けていないかを確認してください。Codex app-server では、この挙動を実際に確認しています（[7.1](#71-codexcodex-app-server)）。

### 13.5 同じホストが二重に表示される

`Zabbix Host: claude-node01` と `OpenTelemetry システム: claude-node01` が両方表示されるのは正常です（[1 章](#1-このtopologyが表すもの)）。

### 13.6 期待と違う Proxy の配下に表示される

`holoztek.zabbix.proxyid` の値を確認してください。ウィジェットは `host.name` や IP アドレスから Proxy を推測しないため、この値が正しくないと正しい経路につながりません。送信元が自分でこの属性を設定していないかも確認してください（[5.4](#54-セキュリティ上の注意)）。

### 13.7 「APM システムが多すぎるため、一部を表示していません。」と表示される

[10.4](#104-警告が出たときの対処) を参照してください。

## 14. 既知の制約

- `holoztek.zabbix.proxyid` は認証情報ではありません。送信元が同じ属性を設定した場合は区別できません。
- 表示されているかどうかは「期間内に Span が観測された」ことを示すだけで、現在受信中であることや、Agent が動いていることを示すものではありません。
- 最後に Span を受信した時刻はウィジェットには表示されません。**APM → Traces** で確認してください。
- Span の多い環境では、取得上限のために取りこぼしの警告がほぼ常に表示されることがあります（[10 章](#10-取得上限と取りこぼし)）。
- OTel観測期間を長くすると、期間内の Span が増えるため取りこぼしが起きやすくなります。
- 送信元によってテレメトリの送信頻度は大きく異なります。同じ観測期間でも、残り続ける送信元とすぐ消える送信元があります（[7 章](#7-実機で確認した送信元ごとの挙動)）。
- OTel ノードの表示には対象 Host が 1 台以上表示されている必要がありますが、どの Host を選んだかとは連動しません。条件を満たす全 Proxy 配下のテレメトリを表示します。
- Super admin 以外の利用者では、APM データストアは種別を特定しない「APM データストア」として表示されます。
