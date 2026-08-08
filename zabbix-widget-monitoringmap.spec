%define _rpmfilename %%{NAME}-%%{VERSION}%{dist}.%%{ARCH}.rpm
Name:           zabbix-widget-monitoringmap
Version:        0.1.1
Release:        0
Summary:        Monitoring Map widget for Zabbix dashboard (Vis Network)
License:        Proprietary
BuildArch:      noarch
Requires:       (php >= 8.3 or php8.3-common or php8.4-common or php8.5-common)
Requires:       (php-fpm >= 8.3 or php8.3-fpm or php8.4-fpm or php8.5-fpm)

%description
Zabbix dashboard widget that visualizes the monitoring path (Zabbix Server -
Proxy - Network - Host) as an interactive topology graph using Vis Network
(Canvas2D).

Features:
- Zabbix Server / Proxy / Proxy Group / Network (subnet) / Host nodes
- Network (subnet) nodes auto-derived from host/proxy interface IPs
  (configurable subnet prefix length)
- Device-type icons for hosts (Linux / Windows / network equipment / virtual /
  server), with a switch/router icon reserved for network-equipment hosts and
  a separate cloud icon for Network (subnet) nodes
- Communication method badges on host nodes (Ping / SNMP / Agent / IPMI /
  VMware / ODBC / JMX), detected from each host's items
- Zabbix Server / Proxy / Proxy Group nodes rendered with a Zabbix-brand red
  icon; Proxy nodes turn gray when the proxy is not currently responding
- Only Host nodes carry problem severity coloring (Server/Proxy/Proxy Group/
  Network nodes never show an aggregated severity)
- Receives host/host group selection via broadcast from other widgets (e.g.
  Tree Navigator), receive only
- Object/Icon display mode toggle, drag-to-reposition, hover tooltips
- Japanese and English locale support
- Bundled Vis Network (Apache 2.0 license, no external dependencies)

%prep
# nothing

%install
SRCDIR=%{_sourcedir}/zabbix-widget-monitoringmap
STAGEDIR=%{buildroot}/usr/share/zabbix-widget-monitoringmap

install -d ${STAGEDIR}/actions
install -d ${STAGEDIR}/assets/css
install -d ${STAGEDIR}/assets/js
install -d ${STAGEDIR}/includes
install -d ${STAGEDIR}/locale/ja_JP/LC_MESSAGES
install -d ${STAGEDIR}/locale/en_US/LC_MESSAGES
install -d ${STAGEDIR}/views

install -m 644 ${SRCDIR}/README.md                                              ${STAGEDIR}/
install -m 644 ${SRCDIR}/manifest.json                                          ${STAGEDIR}/
install -m 644 ${SRCDIR}/Module.php                                             ${STAGEDIR}/
install -m 644 ${SRCDIR}/Widget.php                                             ${STAGEDIR}/
install -m 644 ${SRCDIR}/actions/WidgetView.php                                 ${STAGEDIR}/actions/
install -m 644 ${SRCDIR}/assets/css/widget.css                                  ${STAGEDIR}/assets/css/
install -m 644 ${SRCDIR}/assets/js/vis-network.min.js                           ${STAGEDIR}/assets/js/
install -m 644 ${SRCDIR}/assets/js/class.widget.js                              ${STAGEDIR}/assets/js/
install -m 644 ${SRCDIR}/includes/helpers.php                                   ${STAGEDIR}/includes/
install -m 644 ${SRCDIR}/includes/WidgetForm.php                                ${STAGEDIR}/includes/
install -m 644 ${SRCDIR}/locale/ja_JP/LC_MESSAGES/monitoringmap.po              ${STAGEDIR}/locale/ja_JP/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/ja_JP/LC_MESSAGES/monitoringmap.mo              ${STAGEDIR}/locale/ja_JP/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/en_US/LC_MESSAGES/monitoringmap.po              ${STAGEDIR}/locale/en_US/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/en_US/LC_MESSAGES/monitoringmap.mo              ${STAGEDIR}/locale/en_US/LC_MESSAGES/
install -m 644 ${SRCDIR}/views/widget.edit.js.php                               ${STAGEDIR}/views/
install -m 644 ${SRCDIR}/views/widget.edit.php                                  ${STAGEDIR}/views/
install -m 644 ${SRCDIR}/views/widget.view.php                                  ${STAGEDIR}/views/

%files
/usr/share/zabbix-widget-monitoringmap/

%post
if [ -d /usr/share/zabbix/ui/modules ]; then
    ZBXMODDIR=/usr/share/zabbix/ui/modules
elif [ -d /usr/share/zabbix/modules ]; then
    ZBXMODDIR=/usr/share/zabbix/modules
else
    echo "Warning: Zabbix modules directory not found. Skipping module installation." >&2
    exit 0
fi

SRCSTAGE=/usr/share/zabbix-widget-monitoringmap
MODDIR=${ZBXMODDIR}/monitoringmap

rm -rf "${MODDIR}"
mkdir -p "${MODDIR}"
cp -rp "${SRCSTAGE}/." "${MODDIR}/"

%preun
if [ $1 -eq 0 ]; then
    rm -rf /usr/share/zabbix/ui/modules/monitoringmap 2>/dev/null || true
    rm -rf /usr/share/zabbix/modules/monitoringmap 2>/dev/null || true
fi

%changelog
* Sat Aug 8 2026 claude <noreply> - 0.1.1-0
- パッケージ依存関係を修正: PHPパッケージ名がバージョン埋め込み形式
  （例: php8.4-common / php8.4-fpm）の環境でも、無印php/php-fpm形式の
  環境と同様にインストールできるよう、Requiresをブール条件（OR）に変更
* Sat Aug 8 2026 claude <noreply> - 0.1.0-0
- 初回リリース
- Zabbix Server - Proxy(Group) - Network(サブネット) - Host の4階層トポロジー
  グラフ表示
- ネットワーク（サブネット）ノードをホスト/プロキシのインターフェースIPから
  自動算出（マスク長は設定可能）
- ホストの通信方式（Ping/SNMP/Agent/IPMI/VMware/ODBC/JMX）をアイテムから判定
  しアイコンにバッジ表示
- Zabbix Server/Proxy/Proxy Groupは赤背景白抜き文字のアイコンで表示、Proxyが
  応答なし状態の場合はグレー背景黒文字に変化
- 障害重要度の色分けはHostノードのみに適用（Server/Proxy/Proxy Group/Networkは
  配下ホストの障害を集計表示しない）
- ネットワーク機器ホストはスイッチ/ルーターアイコン、ネットワーク（サブネット）
  ノードは雲アイコンで区別して表示
- Tree Navigator等からのブロードキャスト受信によるホスト/ホストグループ絞り込み
  （受信専用）
- オブジェクト/アイコン表示切替、ドラッグ、ホバーツールチップ、ホストクリックで
  host.view遷移
- 設定画面のカラーピッカーに対応
- 日本語/英語ロケール対応
