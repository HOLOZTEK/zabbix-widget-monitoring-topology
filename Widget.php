<?php declare(strict_types = 0);

namespace Modules\MonitoringMap;

use Zabbix\Core\CWidget;

class Widget extends CWidget {

    public function init(): void {
        require_once __DIR__ . '/includes/helpers.php';
        bindtextdomain('monitoringmap', __DIR__ . '/locale');
        bind_textdomain_codeset('monitoringmap', 'UTF-8');
    }

    public function getDefaultName(): string {
        return _mm('Monitoring Map');
    }

    public function getTranslationStrings(): array {
        return [
            'class.widget.js' => [
                'Zabbix Server'         => _mm('Zabbix Server'),
                'Proxy Group'           => _mm('Proxy Group'),
                'Zabbix Proxy'          => _mm('Zabbix Proxy'),
                'Network'               => _mm('Network'),
                'Host'                  => _mm('Host'),
                'Severity'              => _mm('Severity'),
                'Status'                => _mm('Status'),
                'Not responding'        => _mm('Not responding'),
                'Communication method'  => _mm('Communication method'),
                'Filter'                            => _mm('Filter'),
                'Reset'                             => _mm('Reset'),
                'Problem events'                    => _mm('Problem events'),
                'Unacknowledged'                    => _mm('Unacknowledged'),
                'Acknowledged'                       => _mm('Acknowledged'),
                'Host status'                       => _mm('Host status'),
                'In maintenance'                    => _mm('In maintenance'),
                'Disabled hosts'                    => _mm('Disabled hosts'),
                'Interface'                         => _mm('Interface'),
                'Available'                         => _mm('Available'),
                'Mixed'                             => _mm('Mixed'),
                'Not available'                     => _mm('Not available'),
                'Unknown'                           => _mm('Unknown'),
                'Host configuration'                => _mm('Host configuration'),
                'No interface configured'           => _mm('No interface configured'),
                'Local host monitoring'             => _mm('Local host monitoring'),
                'Monitoring route'                  => _mm('Monitoring route'),
                'Monitoring method'                 => _mm('Monitoring method'),
                'Ping'                              => _mm('Ping'),
                'Zabbix Agent'                      => _mm('Zabbix Agent'),
                'SNMP'                              => _mm('SNMP'),
                'IPMI'                              => _mm('IPMI'),
                'JMX'                               => _mm('JMX'),
                'Other'                             => _mm('Other'),
                'No hosts match the current filter.' => _mm('No hosts match the current filter.'),
            ]
        ];
    }
}
