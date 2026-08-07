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
            ]
        ];
    }
}
