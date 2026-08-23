<?php declare(strict_types = 0);

function _holoztek_mm(string $string): string {
	return dgettext('holoztek-monitoringmap', $string);
}

const HOLOZTEK_MM_NODE_SERVER = 'server';
const HOLOZTEK_MM_NODE_PROXY_GROUP = 'proxy_group';
const HOLOZTEK_MM_NODE_PROXY = 'proxy';
const HOLOZTEK_MM_NODE_NETWORK = 'network';
const HOLOZTEK_MM_NODE_CLUSTER = 'cluster';
const HOLOZTEK_MM_NODE_DATACENTER = 'datacenter';
const HOLOZTEK_MM_NODE_HOST = 'host';

const HOLOZTEK_MM_COMM_PING = 'ping';
const HOLOZTEK_MM_COMM_SNMP = 'snmp';
const HOLOZTEK_MM_COMM_AGENT = 'agent';
const HOLOZTEK_MM_COMM_IPMI = 'ipmi';
const HOLOZTEK_MM_COMM_VMWARE = 'vmware';
const HOLOZTEK_MM_COMM_ODBC = 'odbc';
const HOLOZTEK_MM_COMM_JMX = 'jmx';
const HOLOZTEK_MM_COMM_K8S = 'k8s';

// Host group name the official Zabbix "VMware" template's VM discovery rule
// (vmware.vm.discovery) auto-assigns to every VM host it creates via host
// prototype - a fixed marker distinguishing a VM host from a Hypervisor host.
// A VM host has no comm-method-classifiable item of its own (no items at all
// until a guest-monitoring template is separately assigned to it), so this
// group membership is the only current way to identify one - see
// WidgetView::doAction().
const HOLOZTEK_MM_VMWARE_VM_GROUP = '(vm)';

// Communication methods whose host population scales up/down on its own and
// has no Datacenter/vCenter-style hierarchy of its own (Kubernetes node/
// component hosts) - see holoztek_mm_host_cluster_method(). All such hosts
// under one upstream collapse into a single flat Cluster node. VMware is
// deliberately NOT here: a VMware Hypervisor host gets its own dedicated
// Datacenter/Cluster placement instead (see WidgetView::addVmwareHierarchy()),
// since vCenter/ESXi's own Datacenter/Cluster/Host structure is real
// discoverable data (vmware.hv.datacenter.name/vmware.hv.cluster.name), not
// just a flat bucket. ODBC is also excluded: it's a fixed check against one
// DB target, not a scaling host population, so it keeps the plain "Unknown
// network" fallback.
const HOLOZTEK_MM_CLUSTER_COMM_METHODS = [HOLOZTEK_MM_COMM_K8S];

// Zabbix 7.0 item type constants (see ITEM_TYPE_* in include/defines.inc.php).
// There is no dedicated VMware item type - VMware monitoring runs as
// ITEM_TYPE_SIMPLE items with a "vmware."-prefixed key, same mechanism as the
// built-in "icmpping"-prefixed Ping checks.
const HOLOZTEK_MM_ITEM_TYPE_ZABBIX = 0;
const HOLOZTEK_MM_ITEM_TYPE_SIMPLE = 3;
const HOLOZTEK_MM_ITEM_TYPE_SNMP = 20;
const HOLOZTEK_MM_ITEM_TYPE_IPMI = 12;
const HOLOZTEK_MM_ITEM_TYPE_DB_MONITOR = 11;
const HOLOZTEK_MM_ITEM_TYPE_JMX = 16;
const HOLOZTEK_MM_ITEM_TYPE_ZABBIX_ACTIVE = 7;
const HOLOZTEK_MM_ITEM_TYPE_HTTPAGENT = 19;

// Zabbix's ZBX_SEVERITY_OK (-1, "no active problem") and its standard
// ".status-green" color from the frontend theme CSS - CSeverityHelper::getColor()
// only covers the 6 configured trigger severities (0-5), not this sentinel.
const HOLOZTEK_MM_SEVERITY_OK = -1;
const HOLOZTEK_MM_SEVERITY_OK_COLOR = '#59db8f';

// Maps a single item (type + key_) to the communication method it implies, or
// null if the item type doesn't correspond to any of the methods this widget
// distinguishes (trapper items, calculated items, etc).
function holoztek_mm_item_comm_method(int $type, string $key): ?string {
	switch ($type) {
		case HOLOZTEK_MM_ITEM_TYPE_ZABBIX:
		case HOLOZTEK_MM_ITEM_TYPE_ZABBIX_ACTIVE:
			return HOLOZTEK_MM_COMM_AGENT;
		case HOLOZTEK_MM_ITEM_TYPE_SNMP:
			return HOLOZTEK_MM_COMM_SNMP;
		case HOLOZTEK_MM_ITEM_TYPE_IPMI:
			return HOLOZTEK_MM_COMM_IPMI;
		case HOLOZTEK_MM_ITEM_TYPE_JMX:
			return HOLOZTEK_MM_COMM_JMX;
		case HOLOZTEK_MM_ITEM_TYPE_DB_MONITOR:
			return HOLOZTEK_MM_COMM_ODBC;
		case HOLOZTEK_MM_ITEM_TYPE_SIMPLE:
			if (str_starts_with($key, 'icmpping')) {
				return HOLOZTEK_MM_COMM_PING;
			}
			if (str_starts_with($key, 'vmware.')) {
				return HOLOZTEK_MM_COMM_VMWARE;
			}
			return null;
		case HOLOZTEK_MM_ITEM_TYPE_HTTPAGENT:
			// The official "Kubernetes ... by HTTP" templates run every check as
			// an HTTP agent item; type=19 alone is too broad (any host could use
			// HTTP agent items for unrelated checks), so only "kube."/"kubernetes."
			// key_ prefixes - the templates' own convention - count as Kubernetes.
			if (str_starts_with($key, 'kube.') || str_starts_with($key, 'kubernetes.')) {
				return HOLOZTEK_MM_COMM_K8S;
			}
			return null;
		default:
			return null;
	}
}

// $items is a flat list of ['hostid' => .., 'type' => .., 'key_' => ..].
// Returns [hostid => [comm_method, ...]] with each host's methods sorted in
// the fixed display order below (rather than discovery order), so the badge
// row on the node icon is stable across reloads.
function holoztek_mm_comm_methods_by_host(array $items): array {
	$order = [HOLOZTEK_MM_COMM_PING, HOLOZTEK_MM_COMM_SNMP, HOLOZTEK_MM_COMM_AGENT, HOLOZTEK_MM_COMM_IPMI, HOLOZTEK_MM_COMM_VMWARE, HOLOZTEK_MM_COMM_ODBC, HOLOZTEK_MM_COMM_JMX, HOLOZTEK_MM_COMM_K8S];

	$by_host = [];
	foreach ($items as $item) {
		$method = holoztek_mm_item_comm_method((int) $item['type'], (string) $item['key_']);
		if ($method === null) {
			continue;
		}
		$by_host[$item['hostid']][$method] = true;
	}

	foreach ($by_host as $hostid => $methods) {
		$by_host[$hostid] = array_values(array_intersect($order, array_keys($methods)));
	}

	return $by_host;
}

// $problems is Problem.get output with 'severity', 'acknowledged' and 'hosts'
// (selectHosts: ['hostid']) selected. Returns [hostid => ['ack' => severity,
// 'unack' => severity]], each bucket only present if that host has at least
// one active problem in it - this split (rather than one combined max) is
// what lets the client-side ack/unack filter toggles recompute each host's
// effective severity locally, without a server round-trip (see
// CWidgetHoloztekMonitoringMap#effectiveSeverity()).
function holoztek_mm_severity_by_host_ack(array $problems): array {
	$by_host = [];
	foreach ($problems as $problem) {
		$severity = (int) $problem['severity'];
		$bucket = ((int) $problem['acknowledged']) === 1 ? 'ack' : 'unack';

		foreach ($problem['hosts'] ?? [] as $host) {
			$hostid = $host['hostid'];
			if (!isset($by_host[$hostid][$bucket]) || $severity > $by_host[$hostid][$bucket]) {
				$by_host[$hostid][$bucket] = $severity;
			}
		}
	}

	return $by_host;
}

// HOLOZTEK_MM_SEVERITY_OK isn't one of CSeverityHelper::getColor()'s cases (it only
// covers the 6 configured trigger severities), so it's handled separately here.
function holoztek_mm_severity_color(int $severity): string {
	return $severity < 0 ? HOLOZTEK_MM_SEVERITY_OK_COLOR : '#' . \CSeverityHelper::getColor($severity);
}

function holoztek_mm_severity_label(int $severity): string {
	return \CSeverityHelper::getName($severity);
}

// A host's interface availability, aggregated across all its interfaces from
// Zabbix's own per-interface INTERFACE_AVAILABLE_* state (0=unknown,
// 1=available, 2=unavailable) - no Widget-specific Active/Passive or
// response-time interpretation is applied:
// - "available": at least one interface is available (1), none are
//   unavailable (2).
// - "unavailable": at least one interface is unavailable (2), none are
//   available (1).
// - "mixed": at least one interface is available (1) AND at least one is
//   unavailable (2).
// - "unknown": no interfaces, or every interface is still
//   INTERFACE_AVAILABLE_UNKNOWN (0). A host with no interfaces at all is
//   deliberately "unknown" rather than "unavailable" - that's what the
//   separate "has_interface" flag is for.
function holoztek_mm_host_availability(array $interfaces): string {
	$any_unavailable = false;
	$any_available = false;

	foreach ($interfaces as $iface) {
		$available = (int) ($iface['available'] ?? 0);
		if ($available === 2) {
			$any_unavailable = true;
		}
		elseif ($available === 1) {
			$any_available = true;
		}
	}

	if ($any_available && $any_unavailable) {
		return 'mixed';
	}
	if ($any_unavailable) {
		return 'unavailable';
	}

	return $any_available ? 'available' : 'unknown';
}

// A host counts as monitoring "itself" (the local Zabbix Server / monitoring
// source system) if any of its interfaces resolves to the local loopback -
// IP 127.0.0.1, or DNS name "localhost" - per user-specified criterion
// (no existing detection logic previously existed in this widget for this).
function holoztek_mm_host_is_local(array $interfaces): bool {
	foreach ($interfaces as $iface) {
		$ip = trim((string) ($iface['ip'] ?? ''));
		if ($ip === '127.0.0.1') {
			return true;
		}

		$dns = trim((string) ($iface['dns'] ?? ''));
		if (strcasecmp($dns, 'localhost') === 0) {
			return true;
		}
	}

	return false;
}

// Ported as-is from the base topologymap-visnetwork widget's detectDeviceType().
function holoztek_mm_detect_device_type(array $host): string {
	$inv = is_array($host['inventory'] ?? null) ? $host['inventory'] : [];
	$inv_os = strtolower($inv['os'] ?? '');
	$inv_type = strtolower($inv['type'] ?? '');
	$tmpl = strtolower(implode(' ', array_column($host['parentTemplates'] ?? [], 'name')));

	if (preg_match('/linux|ubuntu|debian|centos|rhel|alma|rocky|fedora|suse/', $inv_os)
			|| preg_match('/linux|ubuntu|debian|centos|rhel|alma|rocky|fedora|suse/', $tmpl)) {
		return 'linux';
	}

	if (str_contains($inv_os, 'windows') || str_contains($tmpl, 'windows')) {
		return 'windows';
	}

	if (preg_match('/cisco|juniper|arista|huawei|fortinet|paloalto|mikrotik|extreme|f5/', $tmpl)
			|| in_array($inv_type, ['network device', 'switch', 'router', 'firewall', 'load balancer'], true)) {
		return 'network';
	}

	if (str_contains($tmpl, 'vmware') || str_contains($tmpl, 'hyper-v') || str_contains($inv_type, 'virtual')) {
		return 'virtual';
	}

	return 'server';
}

// Picks the IP address used to place a host in a network node: the interface
// flagged 'main' for the lowest-numbered interface type present (Agent=1,
// SNMP=2, IPMI=3, JMX=4 per Zabbix's own INTERFACE_TYPE_* priority), falling
// back to the first interface with a non-empty 'ip'. Returns null if no
// interface has a usable IPv4 address (agent-less / trapper-only hosts).
function holoztek_mm_host_primary_ip(array $interfaces): ?string {
	if ($interfaces === []) {
		return null;
	}

	usort($interfaces, function (array $a, array $b): int {
		$main_cmp = ((int) ($b['main'] ?? 0)) <=> ((int) ($a['main'] ?? 0));
		if ($main_cmp !== 0) {
			return $main_cmp;
		}
		return ((int) ($a['type'] ?? 99)) <=> ((int) ($b['type'] ?? 99));
	});

	foreach ($interfaces as $iface) {
		$ip = trim((string) ($iface['ip'] ?? ''));
		if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
			return $ip;
		}
	}

	return null;
}

// Returns the "network.network/prefix" CIDR string an IPv4 address belongs
// to, or null if $ip isn't a valid IPv4 address.
function holoztek_mm_ipv4_cidr(string $ip, int $prefix_length): ?string {
	if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
		return null;
	}

	$prefix_length = max(1, min(32, $prefix_length));

	$ip_long = ip2long($ip);
	if ($ip_long === false) {
		return null;
	}

	$mask = $prefix_length === 32 ? 0xFFFFFFFF : (~0 << (32 - $prefix_length)) & 0xFFFFFFFF;
	$network = $ip_long & $mask;

	return long2ip($network) . '/' . $prefix_length;
}

function holoztek_mm_node_id_server(): string {
	return 'srv';
}

function holoztek_mm_node_id_proxy(string $proxyid): string {
	return 'p_' . $proxyid;
}

function holoztek_mm_node_id_proxy_group(string $proxy_groupid): string {
	return 'pg_' . $proxy_groupid;
}

function holoztek_mm_node_id_host(string $hostid): string {
	return 'h_' . $hostid;
}

// One network node per (upstream node, CIDR) pair. Scoping by $upstream (the
// Server/Proxy node id the network sits under) keeps hosts under different
// Proxies from merging into the same network node just because they share a
// subnet - a host belongs to exactly one Proxy, so that relationship has to
// stay unambiguous in the graph. The "unknown network" fallback is scoped the
// same way, collapsing per upstream rather than into one single global node.
function holoztek_mm_node_id_network(string $upstream, ?string $cidr): string {
	$suffix = $cidr === null ? 'unknown' : str_replace(['.', '/'], '_', $cidr);

	return 'n_' . $upstream . '_' . $suffix;
}

// Returns the comm method (see HOLOZTEK_MM_CLUSTER_COMM_METHODS) a host should
// be grouped under a Cluster node for, or null if it belongs under the normal
// IP-subnet Network node instead. A host is checked against each cluster
// method in the same fixed order used elsewhere so a host that somehow trips
// both (not expected in practice) still gets one stable, reproducible answer.
function holoztek_mm_host_cluster_method(array $comm_methods): ?string {
	foreach (HOLOZTEK_MM_CLUSTER_COMM_METHODS as $method) {
		if (in_array($method, $comm_methods, true)) {
			return $method;
		}
	}

	return null;
}

function holoztek_mm_cluster_label(string $method): string {
	return match ($method) {
		HOLOZTEK_MM_COMM_K8S => _holoztek_mm('Kubernetes cluster'),
		default              => _holoztek_mm('Cluster'),
	};
}

// One cluster node per (upstream node, comm method) pair - same per-upstream
// scoping rationale as holoztek_mm_node_id_network(), so a Kubernetes cluster
// under one upstream doesn't collapse with one under another.
function holoztek_mm_node_id_cluster(string $upstream, string $method): string {
	return 'c_' . $upstream . '_' . $method;
}

// Deterministic, filesystem/id-safe representation of an arbitrary
// (potentially non-ASCII, e.g. a Japanese Datacenter/Cluster name) string for
// use inside a Cytoscape/vis-network node id. Keeping a short ASCII prefix of
// the original text makes the generated id easier to spot in debug output,
// but the actual uniqueness guarantee comes from the hash suffix - two
// different names that happen to collapse to the same ASCII-stripped prefix
// (e.g. differing only in punctuation or non-ASCII characters) still get
// distinct node ids.
function holoztek_mm_id_slug(string $name): string {
	$slug = preg_replace('/[^A-Za-z0-9]+/', '_', $name);
	$slug = trim((string) $slug, '_');

	return ($slug !== '' ? $slug . '_' : '') . substr(md5($name), 0, 8);
}

// One Datacenter/vCenter node per (upstream node, datacenter name) pair - same
// per-upstream scoping rationale as holoztek_mm_node_id_network().
function holoztek_mm_node_id_datacenter(string $upstream, string $name): string {
	return 'dc_' . $upstream . '_' . holoztek_mm_id_slug($name);
}

// One VMware Cluster node per (parent Datacenter node, cluster name) pair -
// scoped under the Datacenter node id (rather than the outer upstream)
// because a cluster only ever makes sense within the one Datacenter/vCenter
// it was discovered in.
function holoztek_mm_node_id_vmware_cluster(string $datacenter_node, string $name): string {
	return 'vc_' . $datacenter_node . '_' . holoztek_mm_id_slug($name);
}
