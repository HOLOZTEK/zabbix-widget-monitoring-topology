%define _rpmfilename %%{NAME}-%%{VERSION}.%%{ARCH}.rpm
Name:           zabbix-widget-monitoring-topology
Version:        1.0.7
Release:        0
Summary:        Monitoring Topology widget for Zabbix dashboard (Vis Network)
License:        MIT
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
SRCDIR=%{_sourcedir}/zabbix-widget-monitoring-topology
STAGEDIR=%{buildroot}/usr/share/zabbix-widget-monitoring-topology
LICENSEDIR=%{buildroot}%{_licensedir}/%{name}

install -d ${LICENSEDIR}
install -m 644 ${SRCDIR}/LICENSE                                                ${LICENSEDIR}/

install -d ${STAGEDIR}/actions
install -d ${STAGEDIR}/assets/css
install -d ${STAGEDIR}/assets/js
install -d ${STAGEDIR}/includes
install -d ${STAGEDIR}/locale/ja_JP/LC_MESSAGES
install -d ${STAGEDIR}/locale/en_US/LC_MESSAGES
install -d ${STAGEDIR}/views

install -m 644 ${SRCDIR}/LICENSE                                                ${STAGEDIR}/
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
install -m 644 ${SRCDIR}/locale/ja_JP/LC_MESSAGES/holoztek-monitoringmap.po     ${STAGEDIR}/locale/ja_JP/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/ja_JP/LC_MESSAGES/holoztek-monitoringmap.mo     ${STAGEDIR}/locale/ja_JP/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/en_US/LC_MESSAGES/holoztek-monitoringmap.po     ${STAGEDIR}/locale/en_US/LC_MESSAGES/
install -m 644 ${SRCDIR}/locale/en_US/LC_MESSAGES/holoztek-monitoringmap.mo     ${STAGEDIR}/locale/en_US/LC_MESSAGES/
install -m 644 ${SRCDIR}/views/widget.edit.js.php                               ${STAGEDIR}/views/
install -m 644 ${SRCDIR}/views/widget.edit.php                                  ${STAGEDIR}/views/
install -m 644 ${SRCDIR}/views/widget.view.php                                  ${STAGEDIR}/views/

%files
%license %{_licensedir}/%{name}/LICENSE
/usr/share/zabbix-widget-monitoring-topology/

%post
if [ -d /usr/share/zabbix/ui/modules ]; then
    ZBXMODDIR=/usr/share/zabbix/ui/modules
elif [ -d /usr/share/zabbix/modules ]; then
    ZBXMODDIR=/usr/share/zabbix/modules
else
    echo "Warning: Zabbix modules directory not found. Skipping module installation." >&2
    exit 0
fi

SRCSTAGE=/usr/share/zabbix-widget-monitoring-topology
MODDIR=${ZBXMODDIR}/holoztek_monitoringmap
OLDMODDIR=${ZBXMODDIR}/monitoringmap

# 自パッケージ専有のディレクトリなので無条件で置き換える
rm -rf "${MODDIR}"
mkdir -p "${MODDIR}"
cp -rp "${SRCSTAGE}/." "${MODDIR}/"

# v1.0.0以前は modules/monitoringmap という汎用的すぎる名前を使っていたため、
# 別ベンダーのモジュールが同名ディレクトリを先に使っている可能性がある。
# 自動削除は「author が HOLOZTEK と明記されている」または「id が既に
# holoztek_monitoringmap（新形式、当パッケージ以外が書く可能性は実質無い）」
# の場合のみに限定する。旧形式id(monitoringmap)かつauthor欄なしのケース
# （v1.0.0のHOLOZTEK製と、authorを書いていない別ベンダー製が区別不能）は
# 自動削除せず警告のみとし、手動確認・削除を促す。
if [ -f "${OLDMODDIR}/manifest.json" ]; then
    ID_VAL=$(grep -Eo '"id"[[:space:]]*:[[:space:]]*"[^"]*"' "${OLDMODDIR}/manifest.json" | head -1 | sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/')
    AUTHOR_VAL=$(grep -Eo '"author"[[:space:]]*:[[:space:]]*"[^"]*"' "${OLDMODDIR}/manifest.json" | head -1 | sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/')
    AUTO_OK=0
    if [ "${AUTHOR_VAL}" = "HOLOZTEK" ] || [ "${ID_VAL}" = "holoztek_monitoringmap" ]; then
        AUTO_OK=1
    fi
    if [ "${AUTO_OK}" -eq 1 ]; then
        rm -rf "${OLDMODDIR}"
    else
        echo "Warning: ${OLDMODDIR} exists (id=${ID_VAL:-unknown}, author=${AUTHOR_VAL:-unset}) but could not be confirmed as a HOLOZTEK monitoring-topology install. Leaving it in place; please verify manually (e.g. namespace=MonitoringMap, js_class=CWidgetMonitoringMap indicates the old HOLOZTEK v1.0.0 install) and remove it yourself if appropriate. It may instead belong to a different vendor's module." >&2
    fi
fi

%preun
if [ $1 -eq 0 ]; then
    rm -rf /usr/share/zabbix/ui/modules/holoztek_monitoringmap 2>/dev/null || true
    rm -rf /usr/share/zabbix/modules/holoztek_monitoringmap 2>/dev/null || true
fi

%changelog
* Thu Aug 27 2026 claude <noreply> - 1.0.7-0
- ユーザー報告のVMware表示不具合2件を修正:
  1. Hypervisorホストの接続用ホスト（master）がウィジェットの選択範囲外の
     場合、Datacenterノードがフォールバック時にNetworkノードを経由せず
     Server/Proxyへ直結し、Networkノードが表示されない不具合を修正。VMの
     フォールバックと同様に接続元IP/マクロからNetworkノードを生成しその
     配下へ接続するよう変更
  2. Hypervisorの接続用ホスト（例:"ESXi#1 (VMware ESXi)"）自身が、vCenter
     インベントリのホストグループ階層（Hypervisor/VM側が自動所属する
     「<datacenter>」「<datacenter>/vm (vm)」等）と全く接点のない別グループ
     （例:"Hypervisors"）にのみ所属しているため、そのインベントリ階層経由の
     ホスト選択では接続用ホストが常に選択範囲から漏れ、Datacenter/Cluster
     チェーンの根となるノードごと表示されない不具合を修正。
     host.get()のselectDiscoveryRuleで判明する接続用ホストを、Server/Proxy/
     Proxy Groupノードと同様にウィジェットの選択範囲に関わらず自動取得し
     表示するよう変更
* Mon Aug 24 2026 claude <noreply> - 1.0.6-0
- コードレビュー issue #7/#8 対応（v1.0.5レビュー、reviewer codex）:
  issue #7: VM識別用ホストグループの判定を固定文字列"(vm)"との完全一致から、
  公式VMwareテンプレートが実際に生成する"<cluster> (vm)"/"<dc>/<folder> (vm)"
  形式に対応する末尾一致（" (vm)"で終わるか）へ修正。従来の完全一致では
  標準構成のVMが一切ESXi配下にネストされなかった不具合を解消
- issue #8: 複数Kubernetesクラスタが同じZabbix Server/Proxy配下で単一の
  Clusterノードへ統合されてしまう不具合を修正。host.get()のselectDiscoveryRule
  で判明するクラスタ集約(状態取得)ホスト自身のhostidをクラスタ識別子として
  ノードIDに組み込み、クラスタごとに別ノードとして表示。ノードラベルも
  集約ホスト名（例: "K8s Cluster (163/164)"）を優先表示するよう改善
* Mon Aug 24 2026 claude <noreply> - 1.0.5-0
- CHost::get()の非推奨パラメータselectGroupsをselectHostGroupsに修正
  （170のダッシュボード表示時に出ていたE_USER_WARNINGを解消）
- VMware階層の不具合を修正（issue #5）: 公式VMwareテンプレートの接続用ホスト
  （{$VMWARE.URL}等のマクロとvmware.hv.discovery等のLLDルールを持つホスト）
  が、Hypervisor固有アイテム(vmware.hv.*)を持つ発見済みHypervisorホストと
  同じ「vmware.」プレフィックスを共有していたため誤ってHypervisorとして
  分類され「不明なデータセンター」ノードとして切り離されて表示される不具合
  を修正。vmware.hv.*アイテムの有無で両者を正しく区別した上で、Hypervisor
  ホストのDatacenter/Clusterチェーンを、host.get()のselectDiscoveryRuleで
  判明する接続用ホスト自身のノード配下にネストするよう変更（Zabbix -
  Network - ESXiホスト - datacenter - cluster - host - vm）。接続用ホストが
  ウィジェットの選択範囲外の場合は従来通りNetworkノードへフォールバック
- Proxmox VE監視ホストのネットワークノード表示を改善: 公式テンプレート
  「Proxmox VE by HTTP」はZabbixインターフェースを持たないエージェントレス
  構成のため従来「不明なネットワーク」表示になっていたが、接続先マクロ
  ({$PVE.URL.HOST})の値をIPアドレスとして解釈できる場合はCIDRネットワーク
  ノードへ、解釈できない場合はマクロ値をそのままラベルとして表示するよう
  変更（HOLOZTEK_MM_CONNECTION_HOST_MACROSに今後同様のマクロ名を追加可能）

* Sat Aug 22 2026 claude <noreply> - 1.0.4-0
- VMware/Kubernetesクラスタノードを追加（gitadminによる170のみ未リリース実装
  f3a5e66を正式反映）: 通信方式ごとに1個の固定クラスタノードを新設し、
  Kubernetesと判定されたホストは既存のNetworkノードではなくこのクラスタ
  ノードに常時接続するよう変更。Kubernetes公式テンプレート(HTTP agentアイ
  テム, kube./kubernetes.キープレフィックス)の検出ロジックを追加
- VMware監視をDatacenter(vCenter)/Cluster/ESXi/VMのツリー構造として表示
  するよう変更（Zabbix - vCenter - Cluster - ESXi - VM）。上記のVMware
  クラスタノード運用は廃止し専用ツリーに置き換え。Datacenter/Cluster名は
  ESXiホスト自身のアイテム(vmware.hv.datacenter.name/vmware.hv.cluster.name)
  から取得、クラスタ未所属（スタンドアロンESXi）の場合はCluster階層を省略。
  VMホストはvCenter/ESXiにアイテムが割り当てられるまでコミュニケーション
  方式で判別できないため、公式VMwareテンプレートのVM検出ルール
  (vmware.vm.discovery)が自動付与する「(vm)」ホストグループ名と、ESXi自身の
  Zabbixホスト名が一致することを利用してVM→ESXiの親子関係を判定（該当する
  ESXiがウィジェットの選択範囲外の場合は通常のNetworkノードへフォールバック）。
  170の実データ（esxi-dev-01配下のVM21台）で動作検証済み

* Tue Aug 11 2026 claude <noreply> - 1.0.3-0
- コードレビュー issue #3/#4 対応:
  1. ダッシュボードフィルタの保存キーが v1.0.1 で
     monitoringmap-filter-<id> から holoztek-monitoringmap-filter-<id> へ
     変更された際に旧キーからの移行ロジックが無く、v0.2.1 以前で保存した
     フィルタ設定が新IDへの移行後に失われる不具合を修正。新キーが未存在の
     場合のみ旧キーを読み込み新キーへコピーする一回限りの移行処理を追加
     （新キーに既存データがある場合は上書きしない）
  2. README.md のRPMインストール例が特定バージョン(1.0.1)に固定され
     リリースの度に陳腐化していたため、<version>プレースホルダに戻し
     バージョン非依存化
  3. debian/control の短いDescriptionが旧名称"Monitoring Map widget"の
     ままだったのを"Monitoring Topology widget"へ修正

* Tue Aug 11 2026 claude <noreply> - 1.0.2-0
- ウィジェット表示名（manifest.json name / getDefaultName()）を
  "Monitoring Map" から "Monitoring Topology" へ変更（パッケージ名・
  リポジトリ名との整合性を確保）。gettextの msgid/msgstr（ja_JP/en_US）も
  追随して更新。機能・内部ID・モジュールディレクトリ名の変更なし。

* Tue Aug 11 2026 claude <noreply> - 1.0.1-0
- モジュール識別子（manifest.id/namespace/action/js_class）にHOLOZTEKプレフィックス
  を付与し他モジュールとの衝突リスクを回避（id: monitoringmap →
  holoztek_monitoringmap）。helpers.phpの全識別子（gettextラッパー_mm()、
  MM_*定数18個、mm_*関数15個）をholoztek_mm_*/HOLOZTEK_MM_*へ全面リネーム。
  gettextドメインをholoztek-monitoringmapへ（.po/.moファイル名も追随）、JS
  クラスCWidgetMonitoringMap→CWidgetHoloztekMonitoringMap、JSグローバル
  window.widget_monitoringmap_form→window.holoztek_monitoringmap_form、CSSの
  .dashboard-widget-monitoringmap→.dashboard-widget-holoztek_monitoringmapへ
  変更。RPMのLICENSE同梱を%license/%{_licensedir}経由の標準的な方式に変更
  （DEBもLICENSEファイルを同梱するよう追加）。モジュール配置ディレクトリも
  modules/monitoringmapからmodules/holoztek_monitoringmapへ変更し、旧
  ディレクトリはmanifest.jsonのid/authorを確認しHOLOZTEK由来と判定できた
  場合のみ自動削除する安全確認ロジックをpostinst/prermに実装（tree-navigator
  v1.4.10・radar-chart v1.0.3で判明した「author欄空欄を削除根拠にしない」
  教訓を最初から反映）
* Mon Aug 10 2026 claude <noreply> - 1.0.0-0
- 無償公開に向けたリリース。機能変更なし。反映内容:
  1. ライセンスをProprietaryからMITへ変更
  2. RPMをel9/el10個別ビルドから単一noarchファイルに統一（_rpmfilenameから
     %%{dist}を除去）。BuildArch: noarchでコンパイル済みバイナリを含まない
     ため、170/171どちらでビルドしても同一内容
  3. Debianパッケージング(.deb)をdebian/配下に追加
  4. パッケージ名をzabbix-widget-monitoringmapからzabbix-widget-monitoring-topology
     に変更（ウィジェット内部ID・モジュールディレクトリ名(monitoringmap)は変更なし）
* Sat Aug 8 2026 claude <noreply> - 0.2.1-0
- コードレビュー issue #2 対応: 通信方式（監視方式）フィルタで、アイテムが
  無い、またはHTTP agent/trapper/calculated等 mm_item_comm_method() が未分類
  とするアイテムのみのホストが、通信方式の全チェックボックスON（既定状態）
  でもマップから消えてしまう回帰不具合を修正。comm_methodsが空配列の場合は
  vmware/odbcと同様に「その他（methodOther）」区分として判定するよう変更
* Sat Aug 8 2026 claude <noreply> - 0.2.0-0
- フィルタ保存キーが実行時ID（getUniqueId）に依存しダッシュボード再読み込みの
  たびにリセットされる不具合を修正、DB保存ID（getWidgetId）を優先使用（issue #1）
- フィルタのホスト状態に「有効ホスト」チェックボックスを追加（デフォルトON）。
  ホストステータス無効・メンテナンス中のホストはデフォルトで非表示に
- フィルタのインターフェイス/監視経路/監視方式の全項目をデフォルトでON化
- フィルタの挙動を統一: 区分内の項目が全て未チェックの場合に「制限なし＝全表示」
  としていた例外動作を廃止し、未チェック項目は常に表示から除外されるよう統一
  （動作の予見性向上）。これに伴いホスト設定区分に「通常ホスト」チェックボックス
  を新設（インターフェイスあり・ローカル監視でない通常ホストの基準タグ）
* Sat Aug 8 2026 claude <noreply> - 0.1.2-0
- 表示フィルタ機能を追加: 障害イベント/ホスト状態/ホスト設定/インターフェイス/
  監視経路/監視方式の6区分（区分内OR・区分間AND）で表示ホストを絞り込み可能に。
  フィルタ状態はブラウザのlocalStorageに保存
- フィルタパネルの各区分を折りたたみ可能に（初期状態は全て折りたたみ）
- 障害イベントを表示しない設定（未確認/確認済み両方OFF）の場合、ホストの
  背景色を透明化（従来は誤ってOK色の緑背景のままだった問題を修正）
- フィルタアイコンの表示位置（左上/右上/左下/右下）を設定画面から選択可能に
- ノードラベルの文字色を設定可能に（未設定時はダッシュボードのテーマに応じて
  自動判定、ダークモードで文字が見えなくなる問題を解消）
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
