<?php declare(strict_types = 0);

namespace Modules\MonitoringMap\Actions;

use API,
	CControllerDashboardWidgetView,
	CControllerResponseData;

class WidgetView extends CControllerDashboardWidgetView {

	private array $node_ids = [];
	private array $edge_keys = [];
	private array $elements = [];

	protected function init(): void {
		parent::init();
		$this->addValidationRules(['widget_unique_id' => 'string']);
	}

	protected function doAction(): void {
		$fv = $this->fields_values;
		$dom_id_suffix = preg_replace('/[^A-Za-z0-9_-]/', '_', $this->getInput('widget_unique_id', ''));

		$settings = [
			'server_label'    => (string) ($fv['server_label'] ?: 'Zabbix Server'),
			'node_font_size'  => (int) ($fv['node_font_size']  ?? 12),
			'node_font_style' => (int) ($fv['node_font_style'] ?? 0),
			'edge_width'      => (int) ($fv['edge_width'] ?? 1),
			'edge_color'      => '#' . ($fv['edge_color'] ?: 'aac4d8'),
		];

		$common = [
			'name'          => $this->getInput('name', $this->widget->getDefaultName()),
			'settings'      => $settings,
			'dom_id_suffix' => $dom_id_suffix,
			'user'          => ['debug_mode' => $this->getDebugMode()]
		];

		$hostids = array_values($fv['hostid'] ?? []);
		$hostgroupids = array_values($fv['hostgroupid'] ?? []);

		if (!$hostids && !$hostgroupids) {
			$this->setResponse(new CControllerResponseData($common + [
				'error'    => 'nothing_selected',
				'elements' => []
			]));
			return;
		}

		$host_filter = $hostgroupids
			? ['groupids' => $this->resolveHostGroupIds($hostgroupids)]
			: ['hostids' => $hostids];

		$hosts = API::Host()->get($host_filter + [
			'output'                => [
				'hostid', 'name', 'status', 'monitored_by', 'proxyid', 'proxy_groupid', 'assigned_proxyid'
			],
			'selectInterfaces'      => ['type', 'ip', 'dns', 'useip', 'main'],
			'selectInventory'       => ['type', 'os'],
			'selectParentTemplates' => ['name'],
			'preservekeys'          => true
		]);

		if (!$hosts) {
			$this->setResponse(new CControllerResponseData($common + [
				'error'    => 'no_hosts',
				'elements' => []
			]));
			return;
		}

		$prefix_length = (int) ($fv['subnet_prefix_length'] ?? 24);

		$items = API::Item()->get([
			'output'   => ['itemid', 'hostid', 'type', 'key_'],
			'hostids'  => array_keys($hosts)
		]);
		$comm_methods_by_host = mm_comm_methods_by_host($items);

		$is_id = static fn($id): bool => $id !== null && (string) $id !== '0' && (string) $id !== '';

		$proxyids = array_values(array_unique(array_filter(array_merge(
			array_column($hosts, 'proxyid'),
			array_column($hosts, 'assigned_proxyid')
		), $is_id)));

		$proxy_groupids = array_values(array_unique(array_filter(
			array_column($hosts, 'proxy_groupid'),
			$is_id
		)));

		$proxies = $proxyids
			? API::Proxy()->get([
				'output'       => ['proxyid', 'name', 'proxy_groupid', 'state'],
				'proxyids'     => $proxyids,
				'preservekeys' => true
			])
			: [];

		$proxy_groups = $proxy_groupids
			? API::ProxyGroup()->get([
				'output'         => ['proxy_groupid', 'name'],
				'proxy_groupids' => $proxy_groupids,
				'preservekeys'   => true
			])
			: [];

		$this->addNode(mm_node_id_server(), $settings['server_label'], MM_NODE_SERVER);

		// Server-ProxyGroup and Server/ProxyGroup-Proxy are direct edges (no
		// network node in between) - unlike the Network-Host segment, the path
		// here isn't derived from an IP so there's no CIDR to place a waypoint at.
		$proxy_group_upstream_node = [];
		foreach ($proxy_groups as $proxy_groupid => $proxy_group) {
			$pg_node = mm_node_id_proxy_group((string) $proxy_groupid);
			$this->addNode($pg_node, (string) $proxy_group['name'], MM_NODE_PROXY_GROUP);
			$this->addEdge(mm_node_id_server(), $pg_node);

			$proxy_group_upstream_node[$proxy_groupid] = $pg_node;
		}

		$proxy_upstream_node = [];
		foreach ($proxies as $proxyid => $proxy) {
			$proxy_node = mm_node_id_proxy((string) $proxyid);

			// ZBX_PROXY_STATE_ONLINE (see include/defines.inc.php) is the only
			// state confirming the Proxy is currently reachable - OFFLINE and
			// UNKNOWN both mean "not confirmed responding" and get the same
			// grayed-out badge (see #TYPE_ICON.proxy_offline in class.widget.js).
			$proxy_unresponsive = ((int) ($proxy['state'] ?? ZBX_PROXY_STATE_UNKNOWN)) !== ZBX_PROXY_STATE_ONLINE;
			$this->addNode($proxy_node, (string) $proxy['name'], MM_NODE_PROXY, [
				'proxy_unresponsive' => $proxy_unresponsive
			]);

			$proxy_parent = $proxy_group_upstream_node[$proxy['proxy_groupid']] ?? mm_node_id_server();
			$this->addEdge($proxy_parent, $proxy_node);

			$proxy_upstream_node[$proxyid] = $proxy_node;
		}

		foreach ($hosts as $hostid => $host) {
			$upstream_node = $this->resolveUpstreamNode($host, $proxy_upstream_node, $proxy_group_upstream_node);

			$host_ip = mm_host_primary_ip($host['interfaces'] ?? []);
			$host_cidr = $host_ip !== null ? mm_ipv4_cidr($host_ip, $prefix_length) : null;
			$network_node = $this->addNetworkNode($upstream_node, $host_cidr);

			$this->addEdge($upstream_node, $network_node);

			$host_node = mm_node_id_host((string) $hostid);
			$this->addNode($host_node, (string) $host['name'], MM_NODE_HOST, [
				'device_type'  => mm_detect_device_type($host),
				'comm_methods' => $comm_methods_by_host[$hostid] ?? []
			]);
			$this->addEdge($network_node, $host_node);
		}

		$this->applySeverities($hosts);

		$this->setResponse(new CControllerResponseData($common + [
			'error'    => null,
			'elements' => $this->elements
		]));
	}

	// Zabbix host groups form a tree via "/"-separated names (e.g. "Linux
	// servers/Web"), but Host.get's groupids filter only matches the exact
	// group - it doesn't walk into subgroups on its own (same underlying
	// pattern CHostGroup::getChildGroupIds() uses internally for permission/
	// tag filter inheritance). Expand each selected group to include every
	// group whose name starts with "<name>/" so a parent-group selection also
	// picks up hosts placed only in a child group.
	private function resolveHostGroupIds(array $groupids): array {
		$groups = API::HostGroup()->get([
			'output'   => ['groupid', 'name'],
			'groupids' => $groupids
		]);

		$all_ids = array_column($groups, 'groupid');

		foreach ($groups as $group) {
			$prefix = $group['name'] . '/';
			$children = API::HostGroup()->get([
				'output'      => ['groupid', 'name'],
				'search'      => ['name' => $prefix],
				'startSearch' => true
			]);

			foreach ($children as $child) {
				if (str_starts_with($child['name'], $prefix)) {
					$all_ids[] = $child['groupid'];
				}
			}
		}

		return array_values(array_unique($all_ids));
	}

	// monitored_by: 0=Server, 1=Proxy, 2=ProxyGroup (ZBX_MONITORED_BY_* in
	// include/defines.inc.php). A ProxyGroup host has an "assigned_proxyid" -
	// the specific member Proxy currently handling it under HA/failover - which
	// may be unset if the group has no proxy online right now, in which case
	// the host falls back to hanging directly off its ProxyGroup node instead
	// of a specific Proxy.
	private function resolveUpstreamNode(array $host, array $proxy_upstream_node, array $proxy_group_upstream_node): string {
		$monitored_by = (int) ($host['monitored_by'] ?? 0);

		if ($monitored_by === 1) {
			return $proxy_upstream_node[$host['proxyid']] ?? mm_node_id_server();
		}

		if ($monitored_by === 2) {
			return $proxy_upstream_node[$host['assigned_proxyid']]
				?? $proxy_group_upstream_node[$host['proxy_groupid']]
				?? mm_node_id_server();
		}

		return mm_node_id_server();
	}

	private function addNode(string $id, string $label, string $type, array $extra = []): void {
		if (isset($this->node_ids[$id])) {
			return;
		}
		$this->node_ids[$id] = true;

		$this->elements[] = [
			'data' => ['id' => $id, 'label' => $label, 'type' => $type] + $extra
		];
	}

	// Scoped by $upstream (the Server or Proxy node the network sits under) so
	// hosts under different Proxies never share a network node just because
	// they happen to be on the same subnet - a host belongs to exactly one
	// Proxy, and merging across upstreams would make that ambiguous in the
	// graph (and in the Proxy edge-highlight feature).
	private function addNetworkNode(string $upstream, ?string $cidr): string {
		$id = mm_node_id_network($upstream, $cidr);
		$this->addNode($id, $cidr ?? _mm('Unknown network'), MM_NODE_NETWORK);

		return $id;
	}

	private function addEdge(string $source, string $target): void {
		$key = $source . '->' . $target;
		if (isset($this->edge_keys[$key])) {
			return;
		}
		$this->edge_keys[$key] = true;

		$this->elements[] = [
			'data' => ['source' => $source, 'target' => $target]
		];
	}

	// Only Host nodes represent an actual monitored object with Problems of its
	// own - Server/Proxy Group/Proxy/Network aren't hosts and can't have
	// Problems. This used to roll the worst downstream host severity up onto
	// those nodes (same convention as Zabbix's own map/tree widgets), but that
	// made it look like Zabbix's own infrastructure was in a problem state, so
	// those node types now carry no severity data at all - see class.widget.js,
	// which falls back to their fixed type color once severity_color is absent.
	private function applySeverities(array $hosts): void {
		// Problem.get has no selectHosts (only Acknowledges/SuppressionData/Tags),
		// so the problem->host link has to go through the triggers it references.
		$problems = $hosts
			? API::Problem()->get([
				'output'  => ['eventid', 'objectid', 'severity'],
				'hostids' => array_keys($hosts),
				'recent'  => false
			])
			: [];

		$triggerids = array_values(array_unique(array_column($problems, 'objectid')));
		$triggers = $triggerids
			? API::Trigger()->get([
				'output'       => ['triggerid'],
				'selectHosts'  => ['hostid'],
				'triggerids'   => $triggerids,
				'preservekeys' => true
			])
			: [];

		foreach ($problems as &$problem) {
			$problem['hosts'] = $triggers[$problem['objectid']]['hosts'] ?? [];
		}
		unset($problem);

		$severity_by_hostid = mm_max_severity_by_host($problems);

		foreach ($this->elements as &$element) {
			if (($element['data']['type'] ?? null) !== MM_NODE_HOST) {
				continue;
			}

			$hostid = substr($element['data']['id'], 2);
			$severity = $severity_by_hostid[$hostid] ?? MM_SEVERITY_OK;
			$element['data']['severity'] = $severity;
			$element['data']['severity_color'] = mm_severity_color($severity);
			$element['data']['severity_label'] = mm_severity_label($severity);
		}
		unset($element);
	}
}
