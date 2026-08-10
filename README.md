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
rpm -ivh zabbix-widget-monitoringmap-<version>.el9.noarch.rpm
systemctl reload httpd php-fpm
```

### 手動インストール

```bash
cp -r monitoringmap /usr/share/zabbix/modules/
systemctl reload httpd php-fpm
```

Zabbix 管理画面 → 管理 → モジュール からウィジェットを有効化してください。

## 使い方

このウィジェットは単独では何も表示しません。同一ダッシュボードに Tree Navigator 等のホスト/ホストグループを送信するウィジェットを配置し、ブロードキャスト連携を設定してください。

- ホストを選択した場合: ZabbixServerからそのホストまでの経路を表示します。
- ホストグループを選択した場合: グループに属する全ホストの経路を表示します。

## License

This project is licensed under the MIT License.

Copyright (c) 2026 ttake-55
HOLOZTEK by ttake-55
