<?php declare(strict_types = 0);

namespace Modules\HoloztekMonitoringMap\Actions;

use API,
	CControllerDashboardWidgetView,
	CControllerResponseData;

use Modules\HoloztekMonitoringMap\Includes\WidgetForm;

class WidgetView extends CControllerDashboardWidgetView {

	private array $node_ids = [];
	private array $edge_keys = [];
	private array $elements = [];
	private array $cluster_member_ips = [];

	protected function init(): void {
		parent::init();
		$this->addValidationRules(['widget_unique_id' => 'string']);
	}

	protected function doAction(): void {
		$fv = $this->fields_values;
		$dom_id_suffix = preg_replace('/[^A-Za-z0-9_-]/', '_', $this->getInput('widget_unique_id', ''));

		$settings = [
			'server_label'     => (string) ($fv['server_label'] ?: 'Zabbix Server'),
			'node_font_size'   => (int) ($fv['node_font_size']  ?? 12),
			'node_font_style'  => (int) ($fv['node_font_style'] ?? 0),
			'node_font_color'  => ($fv['node_font_color'] ?? '') !== '' ? '#' . $fv['node_font_color'] : '',
			'edge_width'       => (int) ($fv['edge_width'] ?? 1),
			'edge_color'       => '#' . ($fv['edge_color'] ?: 'aac4d8'),
			'filter_position'  => (int) ($fv['filter_position'] ?? WidgetForm::FILTER_POSITION_TOP_RIGHT),
			'severity_colors'  => $this->severityColors(),
			'severity_labels'  => $this->severityLabels(),
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
				'hostid', 'name', 'status', 'monitored_by', 'proxyid', 'proxy_groupid', 'assigned_proxyid',
				'maintenance_status'
			],
			'selectInterfaces'      => ['type', 'ip', 'dns', 'useip', 'main', 'available'],
			'selectInventory'       => ['type', 'os'],
			'selectParentTemplates' => ['name'],
			'selectHostGroups'      => ['name'],
			'selectMacros'          => ['macro', 'value'],
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
		$comm_methods_by_host = holoztek_mm_comm_methods_by_host($items);

		// Any host running the official "VMware" template's connection-check items
		// (vmware.fullname/vmware.version/vmware.eventlog/vmware.health.*/
		// vmware.alarms.*, all plain "vmware."-prefixed) is scoped here first,
		// but that includes the master/connection host itself (the one holding
		// {$VMWARE.URL}/vmware.hv.discovery) - it has no datacenter/cluster
		// identity of its own. Only a host that ALSO owns at least one
		// "vmware.hv."-prefixed item is an actual discovered Hypervisor host (see
		// addVmwareHierarchy()); $vmware_hypervisor_hostids narrows down to those.
		// Scoped to just this candidate set so it stays cheap even on a large
		// host selection.
		$vmware_hv_hostids = array_keys(array_filter(
			$comm_methods_by_host,
			static fn(array $methods): bool => in_array(HOLOZTEK_MM_COMM_VMWARE, $methods, true)
		));

		$vmware_hv_marker_items = $vmware_hv_hostids
			? API::Item()->get([
				'output'      => ['hostid'],
				'hostids'     => $vmware_hv_hostids,
				'search'      => ['key_' => 'vmware.hv.'],
				'startSearch' => true
			])
			: [];
		$vmware_hypervisor_hostids = array_flip(array_unique(array_column($vmware_hv_marker_items, 'hostid')));

		// An LLD-discovered Hypervisor host's discoveryRule always belongs to
		// the master/connection host that discovered it (host.get's
		// selectDiscoveryRule returns that item's own hostid, not the
		// Hypervisor's) - this is the only link back from a Hypervisor to its
		// master, used below to nest the Datacenter/Cluster chain under the
		// master host's own node instead of a generic Network node.
		$vmware_master_hostid_by_hv_hostid = [];
		if ($vmware_hypervisor_hostids) {
			$vmware_hv_hosts_with_rule = API::Host()->get([
				'output'              => ['hostid'],
				'hostids'             => array_keys($vmware_hypervisor_hostids),
				'selectDiscoveryRule' => ['hostid']
			]);
			foreach ($vmware_hv_hosts_with_rule as $hv_host) {
				$master_hostid = $hv_host['discoveryRule']['hostid'] ?? null;
				if ($master_hostid !== null) {
					$vmware_master_hostid_by_hv_hostid[$hv_host['hostid']] = $master_hostid;
				}
			}
		}

		$vmware_dc_items = $vmware_hv_hostids
			? API::Item()->get([
				'output'      => ['hostid', 'lastvalue'],
				'hostids'     => $vmware_hv_hostids,
				'search'      => ['key_' => 'vmware.hv.datacenter.name'],
				'startSearch' => true
			])
			: [];
		$vmware_dc_by_hostid = array_column($vmware_dc_items, 'lastvalue', 'hostid');

		$vmware_cl_items = $vmware_hv_hostids
			? API::Item()->get([
				'output'      => ['hostid', 'lastvalue'],
				'hostids'     => $vmware_hv_hostids,
				'search'      => ['key_' => 'vmware.hv.cluster.name'],
				'startSearch' => true
			])
			: [];
		$vmware_cl_by_hostid = array_column($vmware_cl_items, 'lastvalue', 'hostid');

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

		$this->addNode(holoztek_mm_node_id_server(), $settings['server_label'], HOLOZTEK_MM_NODE_SERVER);

		// Server-ProxyGroup and Server/ProxyGroup-Proxy are direct edges (no
		// network node in between) - unlike the Network-Host segment, the path
		// here isn't derived from an IP so there's no CIDR to place a waypoint at.
		$proxy_group_upstream_node = [];
		foreach ($proxy_groups as $proxy_groupid => $proxy_group) {
			$pg_node = holoztek_mm_node_id_proxy_group((string) $proxy_groupid);
			$this->addNode($pg_node, (string) $proxy_group['name'], HOLOZTEK_MM_NODE_PROXY_GROUP);
			$this->addEdge(holoztek_mm_node_id_server(), $pg_node);

			$proxy_group_upstream_node[$proxy_groupid] = $pg_node;
		}

		$proxy_upstream_node = [];
		foreach ($proxies as $proxyid => $proxy) {
			$proxy_node = holoztek_mm_node_id_proxy((string) $proxyid);

			// ZBX_PROXY_STATE_ONLINE (see include/defines.inc.php) is the only
			// state confirming the Proxy is currently reachable - OFFLINE and
			// UNKNOWN both mean "not confirmed responding" and get the same
			// grayed-out badge (see #TYPE_ICON.proxy_offline in class.widget.js).
			$proxy_unresponsive = ((int) ($proxy['state'] ?? ZBX_PROXY_STATE_UNKNOWN)) !== ZBX_PROXY_STATE_ONLINE;
			$this->addNode($proxy_node, (string) $proxy['name'], HOLOZTEK_MM_NODE_PROXY, [
				'proxy_unresponsive' => $proxy_unresponsive
			]);

			$proxy_parent = $proxy_group_upstream_node[$proxy['proxy_groupid']] ?? holoztek_mm_node_id_server();
			$this->addEdge($proxy_parent, $proxy_node);

			$proxy_upstream_node[$proxyid] = $proxy_node;
		}

		// Host nodes whose placement depends on another Host node placed earlier
		// in this same pass (a VM's parent ESXi, or a Hypervisor's own
		// master/connection host) can't be resolved inline, so both are
		// collected here and placed in later passes below, once every node
		// they depend on has its own node id known.
		$hv_node_by_name = [];
		$host_node_by_hostid = [];
		$vmware_vm_hostids = [];
		$vmware_hv_hostids_pending = [];

		foreach ($hosts as $hostid => $host) {
			$comm_methods = $comm_methods_by_host[$hostid] ?? [];
			$is_vmware_hv = isset($vmware_hypervisor_hostids[$hostid]);

			$in_vmware_vm_group = false;
			foreach ($host['hostgroups'] ?? [] as $group) {
				if ($group['name'] === HOLOZTEK_MM_VMWARE_VM_GROUP) {
					$in_vmware_vm_group = true;
					break;
				}
			}

			if (!$is_vmware_hv && $in_vmware_vm_group) {
				$vmware_vm_hostids[] = $hostid;
				continue;
			}

			if ($is_vmware_hv) {
				$vmware_hv_hostids_pending[] = $hostid;
				continue;
			}

			$upstream_node = $this->resolveUpstreamNode($host, $proxy_upstream_node, $proxy_group_upstream_node);
			$group_node = $this->placeHost(
				$upstream_node, $host, (string) $hostid, $comm_methods, $prefix_length,
				$vmware_dc_by_hostid, $vmware_cl_by_hostid, false
			);

			$host_node = $this->addHostNode((string) $hostid, $host, $comm_methods);
			$this->addEdge($group_node, $host_node);

			$host_node_by_hostid[$hostid] = $host_node;
		}

		// A Hypervisor host's Datacenter/Cluster chain nests under its own
		// master/connection host's Host node (Zabbix - Network - ESXi host -
		// datacenter - cluster - host - VM), found via
		// $vmware_master_hostid_by_hv_hostid above. If that master host isn't
		// in this widget's own host selection, fall back to plain Network
		// placement - same graceful-degradation pattern as the VM pass below.
		foreach ($vmware_hv_hostids_pending as $hostid) {
			$host = $hosts[$hostid];
			$comm_methods = $comm_methods_by_host[$hostid] ?? [];

			$master_hostid = $vmware_master_hostid_by_hv_hostid[$hostid] ?? null;
			$master_node = $master_hostid !== null ? ($host_node_by_hostid[$master_hostid] ?? null) : null;

			$upstream_node = $master_node
				?? $this->resolveUpstreamNode($host, $proxy_upstream_node, $proxy_group_upstream_node);

			$group_node = $this->placeHost(
				$upstream_node, $host, (string) $hostid, $comm_methods, $prefix_length,
				$vmware_dc_by_hostid, $vmware_cl_by_hostid, true
			);

			$host_node = $this->addHostNode((string) $hostid, $host, $comm_methods);
			$this->addEdge($group_node, $host_node);

			$host_node_by_hostid[$hostid] = $host_node;
			$hv_node_by_name[$host['name']] = $host_node;
		}

		// A VM host's only current link to its parent ESXi is the host group the
		// official "VMware" template's vmware.vm.discovery rule auto-assigns to
		// it, named identically to the ESXi's own Zabbix host name (see
		// includes/helpers.php's HOLOZTEK_MM_VMWARE_VM_GROUP). If that ESXi isn't
		// in this widget's own host selection, the VM falls back to plain Network
		// placement instead of being silently dropped.
		foreach ($vmware_vm_hostids as $hostid) {
			$host = $hosts[$hostid];
			$comm_methods = $comm_methods_by_host[$hostid] ?? [];

			$hv_node = null;
			foreach ($host['hostgroups'] ?? [] as $group) {
				if (isset($hv_node_by_name[$group['name']])) {
					$hv_node = $hv_node_by_name[$group['name']];
					break;
				}
			}

			if ($hv_node !== null) {
				$group_node = $hv_node;
			}
			else {
				$upstream_node = $this->resolveUpstreamNode($host, $proxy_upstream_node, $proxy_group_upstream_node);
				$host_ip = holoztek_mm_host_primary_ip($host['interfaces'] ?? []);
				$host_cidr = $host_ip !== null ? holoztek_mm_ipv4_cidr($host_ip, $prefix_length) : null;
				$group_node = $this->addNetworkNode($upstream_node, $host_cidr);
				$this->addEdge($upstream_node, $group_node);
			}

			$host_node = $this->addHostNode((string) $hostid, $host, $comm_methods);
			$this->addEdge($group_node, $host_node);
		}

		$this->applyClusterMemberIps();
		$this->applyProblems($hosts);

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
			return $proxy_upstream_node[$host['proxyid']] ?? holoztek_mm_node_id_server();
		}

		if ($monitored_by === 2) {
			return $proxy_upstream_node[$host['assigned_proxyid']]
				?? $proxy_group_upstream_node[$host['proxy_groupid']]
				?? holoztek_mm_node_id_server();
		}

		return holoztek_mm_node_id_server();
	}

	// Route filter classification, independent of resolveUpstreamNode()'s
	// graph-placement fallbacks - this reports the host's actual configured
	// monitored_by regardless of where its Network node ends up hanging (e.g.
	// a ProxyGroup host with an assigned_proxyid still visually attaches under
	// that specific Proxy node, but is still tagged 'proxy_group' here).
	private function resolveRoute(array $host): string {
		return match ((int) ($host['monitored_by'] ?? 0)) {
			1 => 'proxy',
			2 => 'proxy_group',
			default => 'server'
		};
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
		$id = holoztek_mm_node_id_network($upstream, $cidr);
		$this->addNode($id, $cidr ?? _holoztek_mm('Unknown network'), HOLOZTEK_MM_NODE_NETWORK);

		return $id;
	}

	// One cluster node per (upstream, comm method) pair - see
	// holoztek_mm_node_id_cluster() for the scoping rationale.
	private function addClusterNode(string $upstream, string $method): string {
		$id = holoztek_mm_node_id_cluster($upstream, $method);
		$this->addNode($id, holoztek_mm_cluster_label($method), HOLOZTEK_MM_NODE_CLUSTER);

		return $id;
	}

	// Placed as Datacenter -> [Cluster ->] Hypervisor-host, matching vCenter's
	// own inventory hierarchy (a standalone/non-clustered Hypervisor has no
	// Cluster level to pass through). Datacenter/Cluster names come from
	// vmware.hv.datacenter.name/vmware.hv.cluster.name, two items only the
	// Hypervisor host itself carries - see doAction(). Wires every edge along
	// this path itself, since the shape (one vs. two intermediate nodes)
	// varies per host.
	private function addVmwareHierarchy(
		string $upstream, string $hostid, array $dc_by_hostid, array $cl_by_hostid
	): string {
		$dc_name = trim((string) ($dc_by_hostid[$hostid] ?? ''));
		$dc_label = $dc_name !== '' ? $dc_name : _holoztek_mm('Unknown datacenter');
		$dc_node = holoztek_mm_node_id_datacenter($upstream, $dc_label);
		$this->addNode($dc_node, $dc_label, HOLOZTEK_MM_NODE_DATACENTER);
		$this->addEdge($upstream, $dc_node);

		$cl_name = trim((string) ($cl_by_hostid[$hostid] ?? ''));
		if ($cl_name === '') {
			return $dc_node;
		}

		$cl_node = holoztek_mm_node_id_vmware_cluster($dc_node, $cl_name);
		$this->addNode($cl_node, $cl_name, HOLOZTEK_MM_NODE_CLUSTER);
		$this->addEdge($dc_node, $cl_node);

		return $cl_node;
	}

	// Returns the immediate parent (group) node id a host's own Host node
	// should attach to, wiring every edge up to $upstream itself - the three
	// branches (VMware Hypervisor / Kubernetes-style cluster / everything
	// else) each have a differently-shaped path to $upstream, so unlike a
	// plain Network node this can't be reduced to one addEdge() call shared
	// by every caller.
	private function placeHost(
		string $upstream, array $host, string $hostid, array $comm_methods, int $prefix_length,
		array $vmware_dc_by_hostid, array $vmware_cl_by_hostid, bool $is_vmware_hypervisor
	): string {
		if ($is_vmware_hypervisor) {
			return $this->addVmwareHierarchy($upstream, $hostid, $vmware_dc_by_hostid, $vmware_cl_by_hostid);
		}

		$host_ip = holoztek_mm_host_primary_ip($host['interfaces'] ?? []);

		// A host with no interface of its own (e.g. Proxmox VE by HTTP, which
		// connects via a Script/HTTP-agent item, not a Zabbix interface) has
		// no IP for the usual Network-node placement. Its connection macro
		// (see HOLOZTEK_MM_CONNECTION_HOST_MACROS) is the only address it
		// carries - use it as the IP if it parses as one, or fall back to
		// showing it as-is instead of a plain "Unknown network" label.
		$connection_macro_label = null;
		if ($host_ip === null) {
			$connection_macro = holoztek_mm_host_connection_macro_value($host['macros'] ?? []);
			if ($connection_macro !== null) {
				if (filter_var($connection_macro, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
					$host_ip = $connection_macro;
				}
				else {
					$connection_macro_label = $connection_macro;
				}
			}
		}

		$cluster_method = holoztek_mm_host_cluster_method($comm_methods);

		// Kubernetes hosts always attach to their comm method's Cluster node,
		// regardless of whether an IP is known - membership there comes from
		// LLD, not addressing, so grouping by CIDR would be meaningless (and
		// would scatter one cluster's hosts across several Network nodes as
		// it scales). A known IP is kept on the Cluster node as extra info
		// instead - see applyClusterMemberIps().
		if ($cluster_method !== null) {
			$group_node = $this->addClusterNode($upstream, $cluster_method);
			if ($host_ip !== null) {
				$this->cluster_member_ips[$group_node][$host_ip] = true;
			}
		}
		else {
			$host_cidr = $host_ip !== null
				? holoztek_mm_ipv4_cidr($host_ip, $prefix_length)
				: $connection_macro_label;
			$group_node = $this->addNetworkNode($upstream, $host_cidr);
		}

		$this->addEdge($upstream, $group_node);

		return $group_node;
	}

	private function addHostNode(string $hostid, array $host, array $comm_methods): string {
		$interfaces = $host['interfaces'] ?? [];

		$host_node = holoztek_mm_node_id_host($hostid);
		$this->addNode($host_node, (string) $host['name'], HOLOZTEK_MM_NODE_HOST, [
			'device_type'        => holoztek_mm_detect_device_type($host),
			'comm_methods'       => $comm_methods,
			'host_status'        => (int) $host['status'],
			'maintenance_status' => (int) ($host['maintenance_status'] ?? 0),
			'has_interface'      => $interfaces !== [],
			'is_local'           => holoztek_mm_host_is_local($interfaces),
			'availability'       => holoztek_mm_host_availability($interfaces),
			'route'              => $this->resolveRoute($host)
		]);

		return $host_node;
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
	//
	// Each host gets its acknowledged/unacknowledged problems' severities kept
	// separate (severity_ack/severity_unack) rather than combined into one
	// number, so the client's problem-event filter (show/hide by ack status)
	// can recompute the effective severity locally as the user toggles it,
	// without a server round-trip - see CWidgetHoloztekMonitoringMap#effectiveSeverity().
	private function applyProblems(array $hosts): void {
		// Problem.get has no selectHosts (only Acknowledges/SuppressionData/Tags),
		// so the problem->host link has to go through the triggers it references.
		$problems = $hosts
			? API::Problem()->get([
				'output'  => ['eventid', 'objectid', 'severity', 'acknowledged'],
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

		$severity_by_hostid = holoztek_mm_severity_by_host_ack($problems);

		foreach ($this->elements as &$element) {
			if (($element['data']['type'] ?? null) !== HOLOZTEK_MM_NODE_HOST) {
				continue;
			}

			$hostid = substr($element['data']['id'], 2);
			$element['data']['severity_ack']   = $severity_by_hostid[$hostid]['ack'] ?? null;
			$element['data']['severity_unack'] = $severity_by_hostid[$hostid]['unack'] ?? null;
		}
		unset($element);
	}

	// Attaches each Cluster node's known member IPs (collected in the main host
	// loop from hosts that do have a resolvable primary IP - e.g. a VMware
	// Hypervisor or a Kubernetes node host, as opposed to an interface-less
	// aggregate/cluster-level host) as metadata, sorted for stable tooltip
	// rendering. A Cluster node with no known-IP members at all simply gets an
	// empty list rather than being omitted from this pass.
	private function applyClusterMemberIps(): void {
		foreach ($this->elements as &$element) {
			if (($element['data']['type'] ?? null) !== HOLOZTEK_MM_NODE_CLUSTER) {
				continue;
			}

			$ips = array_keys($this->cluster_member_ips[$element['data']['id']] ?? []);
			sort($ips);
			$element['data']['member_ips'] = $ips;
		}
		unset($element);
	}

	// Sent once via $settings rather than per-host, so the client can map an
	// effective severity (recomputed locally as the problem-event filter is
	// toggled - see applyProblems()) to a color/label without a server
	// round-trip. Keyed by string severity number, "-1" for HOLOZTEK_MM_SEVERITY_OK.
	private function severityColors(): array {
		$colors = [(string) HOLOZTEK_MM_SEVERITY_OK => HOLOZTEK_MM_SEVERITY_OK_COLOR];
		for ($severity = 0; $severity <= 5; $severity++) {
			$colors[(string) $severity] = holoztek_mm_severity_color($severity);
		}
		return $colors;
	}

	private function severityLabels(): array {
		$labels = [(string) HOLOZTEK_MM_SEVERITY_OK => _holoztek_mm('OK')];
		for ($severity = 0; $severity <= 5; $severity++) {
			$labels[(string) $severity] = holoztek_mm_severity_label($severity);
		}
		return $labels;
	}
}
