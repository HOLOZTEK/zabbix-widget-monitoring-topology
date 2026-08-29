# zabbix-widget-monitoring-topology

[English](README.md) | 日本語

## 概要

Monitoring Topology は、Zabbix Server から Proxy、ネットワーク、仮想化・クラスタ階層、ホストへ至る監視経路を、対話型のトポロジーグラフとして可視化する Zabbix ダッシュボードウィジェットです。

[Tree Navigator](https://github.com/HOLOZTEK/zabbix-widget-tree-navigator) などからホストまたはホストグループの選択を受信し、選択範囲に対応するトポロジーを再描画します。グラフ描画には Vis Network の Canvas2D を使用し、WebGL は不要です。

<a href="screenshots/monitoring-topology-dashboard-example.png" target="_blank"><img src="screenshots/monitoring-topology-dashboard-example.png" width="750" alt="Tree Navigator と連携した Monitoring Topology ダッシュボード" /></a>

[最新リリース](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/tag/v1.0.6) | [RPM](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.noarch.rpm) | [DEB](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology_1.0.6_all.deb) | [Source](https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.tar.gz)

## Monitoring Topology を使う理由

通常のダッシュボードではホスト状態を確認できますが、各ホストがどの Server／Proxy から、どの経路で監視されているかを一覧で把握するのは容易ではありません。本ウィジェットは、Zabbix の設定・アイテム・ディスカバリ関係を基に監視経路を可視化します。

Server／Proxy とホストの対応、サブネット別の配置、VMware や Kubernetes の親子関係を運用者が俯瞰したい場合に適しています。

## 機能

<table>
  <tr><th align="left" nowrap>機能</th><th align="left">説明</th></tr>
  <tr><td nowrap>監視経路グラフ</td><td>Zabbix Server、Proxy Group、Proxy、Network、Cluster、Datacenter、Host、VM を接続して表示します。</td></tr>
  <tr><td nowrap>ネットワーク自動算出</td><td>ホスト／Proxy のインターフェースIPと設定可能なIPv4プレフィックス長からNetworkノードを算出します。</td></tr>
  <tr><td nowrap>VMware階層</td><td>公式VMwareテンプレートのディスカバリとアイテムから Datacenter / Cluster / ESXi / VM 階層を構成します。</td></tr>
  <tr><td nowrap>Kubernetes監視</td><td>公式Kubernetesテンプレートのキーを検出し、同じ監視経路上の複数クラスタも個別に表示します。</td></tr>
  <tr><td nowrap>Proxmox対応</td><td>インターフェースを持たない監視ホストでは接続先マクロからネットワークまたはラベルを決定します。</td></tr>
  <tr><td nowrap>機器・監視方式表示</td><td>ホスト種別アイコンと Ping、SNMP、Agent、IPMI、VMware、ODBC、JMX、Kubernetes 等のバッジを表示します。</td></tr>
  <tr><td nowrap>運用状態表示</td><td>応答のないProxyを識別し、障害重要度の色はHostノードだけに適用します。</td></tr>
  <tr><td nowrap>対話操作</td><td>自動レイアウト、ノード移動、ツールチップ、ホスト詳細画面への移動に対応します。</td></tr>
  <tr><td nowrap>表示フィルタ</td><td>障害確認状態、ホスト状態、ホスト設定、インターフェース、監視経路、監視方式で絞り込みます。</td></tr>
  <tr><td nowrap>ウィジェット連携</td><td>Tree Navigator 等からホスト／ホストグループの動的パラメータを受信します。</td></tr>
  <tr><td nowrap>表示設定</td><td>ノード文字、エッジ、Serverラベル、サブネット、フィルタボタン位置を設定できます。</td></tr>
</table>

## トポロジーモデル

Monitoring Topology は、Proxy割り当て、インターフェース、ディスカバリ関係、マクロ、監視アイテムからグラフを構成します。主なモデルパターンは次のとおりです。

<table>
  <tr><th align="left" nowrap>パターン</th><th align="left">判定方法（代表的な経路を含む）</th><th align="left">参考画像</th></tr>
  <tr><td nowrap>ZabbixServer経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Network -&gt; Host</code><br>Zabbix Serverがホストを直接監視します。プライマリインターフェースと設定されたサブネットプレフィックスからNetworkノードを決定します。</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="ZabbixServer経由の監視経路"></a></td></tr>
  <tr><td nowrap>ZabbixProxy経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>単体のZabbix Proxyが割り当てられたホストを、そのProxyと算出したNetworkノードの配下に配置します。</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="ZabbixProxy経由の監視経路"></a></td></tr>
  <tr><td nowrap>Proxy Group経由</td><td><strong>代表的な経路:</strong> <code>Zabbix Server -&gt; Proxy Group -&gt; Zabbix Proxy -&gt; Network -&gt; Host</code><br>Proxy Group経由で監視するホストを、グループと監視経路に使われるメンバーProxyの配下に配置します。</td><td><a href="screenshots/monitoring-topology-overview.png" target="_blank"><img src="screenshots/monitoring-topology-overview.png" width="150" alt="Proxy Group経由の監視経路"></a></td></tr>
  <tr><td nowrap>VMware監視</td><td><strong>代表的な経路:</strong> <code>Server/Proxy -&gt; Network -&gt; VMware接続ホスト -&gt; Datacenter -&gt; Cluster -&gt; ESXi -&gt; VM</code><br>公式VMwareテンプレートのディスカバリと <code>vmware.hv.*</code> アイテムから、接続ホスト、インベントリ階層、VMとESXiの関係を構成します。</td><td><a href="screenshots/monitoring-topology-virtualization.png" target="_blank"><img src="screenshots/monitoring-topology-virtualization.png" width="150" alt="VMware監視の全体表示"></a></td></tr>
  <tr><td nowrap>Kubernetes監視</td><td><strong>代表的な経路:</strong> <code>Server/Proxy -&gt; Kubernetes Cluster -&gt; Kubernetesホスト</code><br>公式Kubernetesテンプレートのアイテムキーとディスカバリ親からクラスタを識別し、同じ経路上の複数クラスタも分離します。</td><td><a href="screenshots/monitoring-topology-kubernetes.png" target="_blank"><img src="screenshots/monitoring-topology-kubernetes.png" width="150" alt="Kubernetes監視の経路"></a></td></tr>
</table>

実際の構造はZabbixで取得できるデータに依存します。障害重要度の色を持つのはHostノードだけで、Server、Proxy Group、Proxy、Network、Datacenter、Clusterノードは配下全体の正常性を表しません。

## 表示フィルタ

フィルタパネルは、グラフに残すHostノードを絞り込みます。同じカテゴリ内の選択肢はOR、6つのカテゴリ間はANDで組み合わせます。表示対象の子孫Hostがなくなった上位ノードとエッジも自動的に非表示になります。

<table>
  <tr>
    <td valign="top">
      <table>
        <tr><th align="left" nowrap>カテゴリ</th><th align="left">選択肢</th><th align="left">用途と既定状態</th></tr>
        <tr><td nowrap>障害イベント</td><td>未確認、確認済み</td><td>Hostの表示／非表示ではなく、背景色に反映する障害重要度を制御します。既定では両方ONで、両方OFFにすると障害色を表示しません。</td></tr>
        <tr><td nowrap>ホスト状態</td><td>有効ホスト、メンテナンス中、無効ホスト</td><td>運用状態でHostを絞り込みます。既定では有効ホストだけがONです。</td></tr>
        <tr><td nowrap>ホスト設定</td><td>通常ホスト、インターフェイス設定なし、ローカルホスト監視</td><td>通常のインターフェース監視、インターフェースなし、ローカル監視のHostを選択します。既定では通常ホストだけがONです。</td></tr>
        <tr><td nowrap>インターフェイス</td><td>正常、一部監視不可、監視不可、状況不明</td><td>インターフェースの可用性でHostを絞り込みます。既定ではすべてONです。</td></tr>
        <tr><td nowrap>監視経路</td><td>Zabbix Server、Zabbix Proxy、Proxy Group</td><td>上流の監視経路でHostを絞り込みます。既定ではすべてONです。</td></tr>
        <tr><td nowrap>監視方式</td><td>Ping、Zabbix Agent、SNMP、IPMI、JMX、その他</td><td>検出した監視方式でHostを絞り込みます。既定ではすべてONです。「その他」にはVMware、ODBC、Kubernetes、個別分類できない方式を含みます。</td></tr>
      </table>
    </td>
    <td valign="top" align="center"><a href="screenshots/monitoring-topology-filters.png" target="_blank"><img src="screenshots/monitoring-topology-filters.png" width="180" alt="Monitoring Topology の表示フィルタパネル"></a></td>
  </tr>
</table>

障害イベント以外のカテゴリで全項目をOFFにすると、すべてのHostが非表示になります。フィルタ状態はウィジェットごとにブラウザへ保存され、「リセット」で上記の既定状態へ戻ります。

## 設定項目

<table>
  <tr><th align="left" nowrap>項目</th><th align="left">説明</th></tr>
  <tr><td nowrap>ホスト／ホストグループ</td><td>他ウィジェットと接続する受信専用コネクタです。</td></tr>
  <tr><td nowrap>サブネットプレフィックス長</td><td>Networkノード算出用のIPv4プレフィックス。既定値は24です。</td></tr>
  <tr><td nowrap>Zabbix Serverラベル</td><td>ルートServerノードに表示する名称です。</td></tr>
  <tr><td nowrap>フォントサイズ</td><td>8〜24pxのノードラベルサイズです。</td></tr>
  <tr><td nowrap>スタイル</td><td>通常、太字、斜体から選択します。</td></tr>
  <tr><td nowrap>フォント色</td><td>空欄ではライト／ダークテーマを自動判定し、指定時はその色を使用します。</td></tr>
  <tr><td nowrap>エッジ色</td><td>ノード間を結ぶ線の色です。</td></tr>
  <tr><td nowrap>エッジ幅</td><td>1〜8pxの線幅です。</td></tr>
  <tr><td nowrap>フィルタアイコン位置</td><td>左上、右上、左下、右下から選択します。</td></tr>
</table>

<a href="screenshots/monitoring-topology-settings-ja.png" target="_blank"><img src="screenshots/monitoring-topology-settings-ja.png" width="620" alt="Monitoring Topology ウィジェットの日本語設定画面"></a>

## ダッシュボード連携

本ウィジェットは受信専用で、ホストまたはホストグループを受信するまでは空状態を表示します。

1. `_hostid` または `_hostgroupid` を配信する Tree Navigator 等を配置します。
2. 同じページへ Monitoring Topology を追加します。
3. 設定画面でホスト／ホストグループを送信元ウィジェットへ接続します。
4. ホスト選択時はそのホストの経路、ホストグループ選択時はグループ内ホストの経路を表示します。

## 動作要件

- Zabbix 7.0 以上
- パッケージインストールでは PHP 8.3 以上
- Canvas2D 対応ブラウザ

## インストール

### RPM

```bash
rpm -Uvh zabbix-widget-monitoring-topology-1.0.6.noarch.rpm
```

### DEB

```bash
apt install ./zabbix-widget-monitoring-topology_1.0.6_all.deb
```

パッケージは実行ファイルを利用中のZabbixフロントエンドモジュールディレクトリへ配置します。その後、管理 → モジュールで再スキャンして有効化し、ダッシュボードへ追加してください。

### ソースから

通常はRPMまたはDEBを推奨します。ソースから配置する場合:

```bash
curl -L -o zabbix-widget-monitoring-topology-1.0.6.tar.gz https://github.com/HOLOZTEK/zabbix-widget-monitoring-topology/releases/download/v1.0.6/zabbix-widget-monitoring-topology-1.0.6.tar.gz
tar -xzf zabbix-widget-monitoring-topology-1.0.6.tar.gz
install -d /usr/share/zabbix/ui/modules/holoztek_monitoringmap
cd zabbix-widget-monitoring-topology-1.0.6
cp -a manifest.json Module.php Widget.php actions assets includes locale views /usr/share/zabbix/ui/modules/holoztek_monitoringmap/
```

旧パスを使用する環境では `/usr/share/zabbix/modules/holoztek_monitoringmap` に配置します。Zabbixフロントエンドが読める所有者・権限を設定し、モジュールを再スキャンして有効化してください。

## 旧モジュールIDからの移行

v1.0.1でモジュールIDを `monitoringmap` から `holoztek_monitoringmap` に変更しました。パッケージ名は `zabbix-widget-monitoring-topology` のままです。

1. 現行パッケージまたはソースを配置してモジュールを再スキャンします。
2. `holoztek_monitoringmap` を有効化し、残っている旧 `monitoringmap` を無効化します。
3. ダッシュボードをバックアップまたはエクスポートします。
4. `dashboard.get` で全ページ・全ウィジェットを含む完全な構造を取得します。
5. `type` が `monitoringmap` のウィジェットだけを `holoztek_monitoringmap` へ変更し、`widgetid`、`fields`、`reference` は保持します。
6. 完全な `pages` 構造を指定して `dashboard.update` を呼びます。必要に応じてテンプレートダッシュボードにも適用します。

```php
foreach ($dashboard['pages'] as &$page) {
    foreach ($page['widgets'] as &$widget) {
        if ($widget['type'] === 'monitoringmap') {
            $widget['type'] = 'holoztek_monitoringmap';
        }
    }
}
```

パッケージスクリプトは、manifestから本ウィジェット由来と安全に識別できる場合だけ旧ディレクトリを削除します。判定できないディレクトリは手動確認のため残します。

## ドキュメント

- [変更履歴](docs/CHANGELOG.md)
- [コントリビューション](docs/CONTRIBUTING.md)
- [セキュリティ](docs/SECURITY.md)
- [スクリーンショットガイド](docs/screenshot-guide.md)
- [ライセンス](LICENSE)

## リポジトリ構成

実行時ファイルはルートと `actions/`、`assets/`、`includes/`、`locale/`、`views/` に配置しています。パッケージ定義は `packaging/rpm/` と `debian/`、公開・保守文書は `docs/` に分離しています。

## 同梱依存ライブラリ

`assets/js/vis-network.min.js` は Vis Network 10.1.0 です。ファイルヘッダーに記載されたMITまたはApache-2.0ライセンスで配布されています。

## メンテナー

[HOLOZTEK](https://github.com/HOLOZTEK) が開発・保守しています。

## ライセンス

MIT Licenseです。詳細は [LICENSE](LICENSE) を参照してください。
