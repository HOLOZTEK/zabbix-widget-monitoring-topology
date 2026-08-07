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
			'server_color'    => '#' . ($fv['server_color']  ?: 'c0392b'),
			'proxy_color'     => '#' . ($fv['proxy_color']   ?: 'e08e0b'),
			'network_color'   => '#' . ($fv['network_color'] ?: '7f8c8d'),
			'host_color'      => '#' . ($fv['host_color']    ?: '6a8da8'),
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

		$hostid = $fv['hostid'][0] ?? null;
		$hostgroupid = $fv['hostgroupid'][0] ?? null;

		if (!$hostid && !$hostgroupid) {
			$this->setResponse(new CControllerResponseData($common + [
				'error'    => 'nothing_selected',
				'elements' => []
			]));
			return;
		}

		$host_filter = $hostgroupid
			? ['groupids' => [$hostgroupid]]
			: ['hostids' => [$hostid]];

		$hosts = API::Host()->get($host_filter + [
			'output'                => ['hostid', 'name', 'status', 'monitored_by', 'proxyid'],
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

		$proxyids = array_values(array_unique(array_filter(
			array_column($hosts, 'proxyid'),
			static fn(string $proxyid): bool => $proxyid !== '0' && $proxyid !== ''
		)));

		$proxies = $proxyids
			? API::Proxy()->get([
				'output'       => ['proxyid', 'name', 'operating_mode', 'address', 'allowed_addresses'],
				'proxyids'     => $proxyids,
				'preservekeys' => true
			])
			: [];

		$this->addNode(mm_node_id_server(), $settings['server_label'], MM_NODE_SERVER);

		$proxy_upstream_node = [];
		foreach ($proxies as $proxyid => $proxy) {
			$proxy_ip = mm_proxy_ip($proxy);
			$proxy_cidr = $proxy_ip !== null ? mm_ipv4_cidr($proxy_ip, $prefix_length) : null;
			$network_node = $this->addNetworkNode($proxy_cidr);

			$this->addEdge(mm_node_id_server(), $network_node);

			$proxy_node = mm_node_id_proxy((string) $proxyid);
			$this->addNode($proxy_node, (string) $proxy['name'], MM_NODE_PROXY);
			$this->addEdge($network_node, $proxy_node);

			$proxy_upstream_node[$proxyid] = $proxy_node;
		}

		foreach ($hosts as $hostid => $host) {
			$monitored_by = (int) ($host['monitored_by'] ?? 0);
			$upstream_node = ($monitored_by === 1 && isset($proxy_upstream_node[$host['proxyid']]))
				? $proxy_upstream_node[$host['proxyid']]
				: mm_node_id_server();

			$host_ip = mm_host_primary_ip($host['interfaces'] ?? []);
			$host_cidr = $host_ip !== null ? mm_ipv4_cidr($host_ip, $prefix_length) : null;
			$network_node = $this->addNetworkNode($host_cidr);

			$this->addEdge($upstream_node, $network_node);

			$host_node = mm_node_id_host((string) $hostid);
			$this->addNode($host_node, (string) $host['name'], MM_NODE_HOST, [
				'device_type'  => mm_detect_device_type($host),
				'comm_methods' => $comm_methods_by_host[$hostid] ?? []
			]);
			$this->addEdge($network_node, $host_node);
		}

		$this->setResponse(new CControllerResponseData($common + [
			'error'    => null,
			'elements' => $this->elements
		]));
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

	private function addNetworkNode(?string $cidr): string {
		$id = mm_node_id_network($cidr);
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
}
