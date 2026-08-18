<?php declare(strict_types = 0);

namespace Modules\HoloztekMonitoringMap;

use Zabbix\Core\CWidget;

class Widget extends CWidget {

    public function init(): void {
        require_once __DIR__ . '/includes/helpers.php';
        bindtextdomain('holoztek-monitoringmap', __DIR__ . '/locale');
        bind_textdomain_codeset('holoztek-monitoringmap', 'UTF-8');
    }

    public function getDefaultName(): string {
        return _holoztek_mm('Monitoring Topology');
    }

    public function getTranslationStrings(): array {
        return [
            'class.widget.js' => [
                'Zabbix Server'         => _holoztek_mm('Zabbix Server'),
                'Proxy Group'           => _holoztek_mm('Proxy Group'),
                'Zabbix Proxy'          => _holoztek_mm('Zabbix Proxy'),
                'Network'               => _holoztek_mm('Network'),
                'Cluster'               => _holoztek_mm('Cluster'),
                'Host'                  => _holoztek_mm('Host'),
                'Severity'              => _holoztek_mm('Severity'),
                'Status'                => _holoztek_mm('Status'),
                'Not responding'        => _holoztek_mm('Not responding'),
                'Communication method'  => _holoztek_mm('Communication method'),
                'Known addresses'       => _holoztek_mm('Known addresses'),
                'Filter'                            => _holoztek_mm('Filter'),
                'Reset'                             => _holoztek_mm('Reset'),
                'Problem events'                    => _holoztek_mm('Problem events'),
                'Unacknowledged'                    => _holoztek_mm('Unacknowledged'),
                'Acknowledged'                       => _holoztek_mm('Acknowledged'),
                'Host status'                       => _holoztek_mm('Host status'),
                'Enabled hosts'                     => _holoztek_mm('Enabled hosts'),
                'In maintenance'                    => _holoztek_mm('In maintenance'),
                'Disabled hosts'                    => _holoztek_mm('Disabled hosts'),
                'Interface'                         => _holoztek_mm('Interface'),
                'Available'                         => _holoztek_mm('Available'),
                'Mixed'                             => _holoztek_mm('Mixed'),
                'Not available'                     => _holoztek_mm('Not available'),
                'Unknown'                           => _holoztek_mm('Unknown'),
                'Host configuration'                => _holoztek_mm('Host configuration'),
                'Normal hosts'                       => _holoztek_mm('Normal hosts'),
                'No interface configured'           => _holoztek_mm('No interface configured'),
                'Local host monitoring'             => _holoztek_mm('Local host monitoring'),
                'Monitoring route'                  => _holoztek_mm('Monitoring route'),
                'Monitoring method'                 => _holoztek_mm('Monitoring method'),
                'Ping'                              => _holoztek_mm('Ping'),
                'Zabbix Agent'                      => _holoztek_mm('Zabbix Agent'),
                'SNMP'                              => _holoztek_mm('SNMP'),
                'IPMI'                              => _holoztek_mm('IPMI'),
                'JMX'                               => _holoztek_mm('JMX'),
                'Other'                             => _holoztek_mm('Other'),
                'No hosts match the current filter.' => _holoztek_mm('No hosts match the current filter.'),
            ]
        ];
    }
}
