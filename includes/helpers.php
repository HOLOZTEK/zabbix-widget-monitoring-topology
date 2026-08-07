<?php declare(strict_types = 0);

function _mm(string $string): string {
	return dgettext('monitoringmap', $string);
}

const MM_NODE_SERVER = 'server';
const MM_NODE_PROXY = 'proxy';
const MM_NODE_NETWORK = 'network';
const MM_NODE_HOST = 'host';

const MM_COMM_PING = 'ping';
const MM_COMM_SNMP = 'snmp';
const MM_COMM_AGENT = 'agent';
const MM_COMM_IPMI = 'ipmi';
const MM_COMM_VMWARE = 'vmware';
const MM_COMM_ODBC = 'odbc';
const MM_COMM_JMX = 'jmx';

// Zabbix 7.0 item type constants (see ITEM_TYPE_* in include/defines.inc.php).
// There is no dedicated VMware item type - VMware monitoring runs as
// ITEM_TYPE_SIMPLE items with a "vmware."-prefixed key, same mechanism as the
// built-in "icmpping"-prefixed Ping checks.
const MM_ITEM_TYPE_ZABBIX = 0;
const MM_ITEM_TYPE_SIMPLE = 3;
const MM_ITEM_TYPE_SNMP = 20;
const MM_ITEM_TYPE_IPMI = 12;
const MM_ITEM_TYPE_DB_MONITOR = 11;
const MM_ITEM_TYPE_JMX = 16;
const MM_ITEM_TYPE_ZABBIX_ACTIVE = 7;

// Maps a single item (type + key_) to the communication method it implies, or
// null if the item type doesn't correspond to any of the methods this widget
// distinguishes (trapper items, calculated items, etc).
function mm_item_comm_method(int $type, string $key): ?string {
	switch ($type) {
		case MM_ITEM_TYPE_ZABBIX:
		case MM_ITEM_TYPE_ZABBIX_ACTIVE:
			return MM_COMM_AGENT;
		case MM_ITEM_TYPE_SNMP:
			return MM_COMM_SNMP;
		case MM_ITEM_TYPE_IPMI:
			return MM_COMM_IPMI;
		case MM_ITEM_TYPE_JMX:
			return MM_COMM_JMX;
		case MM_ITEM_TYPE_DB_MONITOR:
			return MM_COMM_ODBC;
		case MM_ITEM_TYPE_SIMPLE:
			if (str_starts_with($key, 'icmpping')) {
				return MM_COMM_PING;
			}
			if (str_starts_with($key, 'vmware.')) {
				return MM_COMM_VMWARE;
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
function mm_comm_methods_by_host(array $items): array {
	$order = [MM_COMM_PING, MM_COMM_SNMP, MM_COMM_AGENT, MM_COMM_IPMI, MM_COMM_VMWARE, MM_COMM_ODBC, MM_COMM_JMX];

	$by_host = [];
	foreach ($items as $item) {
		$method = mm_item_comm_method((int) $item['type'], (string) $item['key_']);
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

// Ported as-is from the base topologymap-visnetwork widget's detectDeviceType().
function mm_detect_device_type(array $host): string {
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
function mm_host_primary_ip(array $interfaces): ?string {
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
function mm_ipv4_cidr(string $ip, int $prefix_length): ?string {
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

// A passive proxy's network is derived from 'address' (the server actively
// connects there, so it's always a single resolvable host/IP). An active
// proxy only has 'allowed_addresses', an IP/CIDR allow-list that isn't
// necessarily a single address (comma-separated ranges, empty, etc) - it's
// only usable here when it resolves to exactly one IPv4 address.
function mm_proxy_ip(array $proxy): ?string {
	$operating_mode = (int) ($proxy['operating_mode'] ?? 1);

	if ($operating_mode === 1) {
		$address = trim((string) ($proxy['address'] ?? ''));
		return filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false ? $address : null;
	}

	$allowed = trim((string) ($proxy['allowed_addresses'] ?? ''));
	if ($allowed === '' || str_contains($allowed, ',') || str_contains($allowed, '-')) {
		return null;
	}

	if (str_contains($allowed, '/')) {
		[$addr, $mask] = explode('/', $allowed, 2);
		if ($mask !== '32' || filter_var($addr, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
			return null;
		}
		return $addr;
	}

	return filter_var($allowed, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false ? $allowed : null;
}

function mm_node_id_server(): string {
	return 'srv';
}

function mm_node_id_proxy(string $proxyid): string {
	return 'p_' . $proxyid;
}

function mm_node_id_host(string $hostid): string {
	return 'h_' . $hostid;
}

// One network node per distinct CIDR string; the "unknown network" fallback
// gets a fixed id of its own so every unresolvable host/proxy collapses into
// the same placeholder node instead of one each.
function mm_node_id_network(?string $cidr): string {
	return $cidr === null ? 'n_unknown' : 'n_' . str_replace(['.', '/'], '_', $cidr);
}
