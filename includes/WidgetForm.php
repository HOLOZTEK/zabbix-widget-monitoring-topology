<?php declare(strict_types = 0);

namespace Modules\HoloztekMonitoringMap\Includes;

use CWidgetsData;

use Zabbix\Widgets\CWidgetForm;

use Zabbix\Widgets\Fields\{
	CWidgetFieldCheckBox,
	CWidgetFieldCheckBoxList,
	CWidgetFieldColor,
	CWidgetFieldIntegerBox,
	CWidgetFieldMultiSelectGroup,
	CWidgetFieldMultiSelectHost,
	CWidgetFieldRadioButtonList,
	CWidgetFieldSelect,
	CWidgetFieldTextBox
};

class WidgetForm extends CWidgetForm {

	public const FONT_STYLE_NORMAL = 0;
	public const FONT_STYLE_BOLD   = 1;
	public const FONT_STYLE_ITALIC = 2;

	public const FILTER_POSITION_TOP_LEFT     = 0;
	public const FILTER_POSITION_TOP_RIGHT    = 1;
	public const FILTER_POSITION_BOTTOM_LEFT  = 2;
	public const FILTER_POSITION_BOTTOM_RIGHT = 3;

	public const BACKEND_DATABASE = 1;
	public const BACKEND_APM      = 2;

	// Relation filter start state, one checkbox each: a checkbox list cannot
	// be saved with everything off. Field name => caption.
	public const DEFAULT_RELATION_FIELDS = [
		'default_rel_monitoring'  => 'Monitoring',
		'default_rel_database'    => 'Database',
		'default_rel_apm_storage' => 'APM storage',
		'default_rel_telemetry'   => 'Telemetry'
	];

	private static function fontStyleValues(): array {
		return [
			self::FONT_STYLE_NORMAL => _holoztek_mm('Normal'),
			self::FONT_STYLE_BOLD   => _holoztek_mm('Bold'),
			self::FONT_STYLE_ITALIC => _holoztek_mm('Italic'),
		];
	}

	private static function filterPositionValues(): array {
		return [
			self::FILTER_POSITION_TOP_LEFT     => _holoztek_mm('Top left'),
			self::FILTER_POSITION_TOP_RIGHT    => _holoztek_mm('Top right'),
			self::FILTER_POSITION_BOTTOM_LEFT  => _holoztek_mm('Bottom left'),
			self::FILTER_POSITION_BOTTOM_RIGHT => _holoztek_mm('Bottom right'),
		];
	}

	// APM stays listed on Zabbix 7.0 so the setting survives a move between
	// versions; WidgetView ignores it there (see holoztek_mm_apm_supported()).
	private static function backendComponentValues(): array {
		return [
			self::BACKEND_DATABASE => _holoztek_mm('Database'),
			self::BACKEND_APM      => holoztek_mm_apm_supported()
				? _holoztek_mm('APM')
				: _holoztek_mm('APM (available on Zabbix 8.0 or later)'),
		];
	}

	public function addFields(): self {
		$this
			// Host: broadcast-receive only. preventDefault() hides the manual
			// pick control, leaving only the "receive from widget" connector, so
			// selection is driven entirely by Tree Navigator etc.
			->addField(
				(new CWidgetFieldMultiSelectHost('hostid', _holoztek_mm('Host')))
					->setMultiple(false)
					->setInType(CWidgetsData::DATA_TYPE_HOST_ID)
					->preventDefault()
					->acceptWidget()
			)
			// Host groups: either several fixed groups picked here, or a group
			// received from a widget (Tree Navigator etc.). The in type stays
			// _hostgroupid (not _hostgroupids) on purpose: the edit form matches a
			// saved reference by "<widget>.<in type>", so changing it would make
			// existing dashboards drop their Navigator link on the next save.
			// WidgetView expands subgroups itself, so both types yield the same hosts.
			->addField(
				(new CWidgetFieldMultiSelectGroup('hostgroupid', _holoztek_mm('Host groups')))
					->setMultiple(true)
					->setInType(CWidgetsData::DATA_TYPE_HOST_GROUP_ID)
					->acceptWidget()
			)
			->addField(
				(new CWidgetFieldIntegerBox('subnet_prefix_length', _holoztek_mm('Subnet prefix length'), 1, 32))
					->setDefault(24)
			)
			->addField(
				(new CWidgetFieldTextBox('server_label', _holoztek_mm('Zabbix Server label')))
					->setDefault('Zabbix Server')
			)
			->addField(
				(new CWidgetFieldIntegerBox('node_font_size', _holoztek_mm('Font size (px)'), 8, 24))
					->setDefault(12)
			)
			->addField(
				(new CWidgetFieldSelect('node_font_style', _holoztek_mm('Style'), self::fontStyleValues()))
					->setDefault(self::FONT_STYLE_NORMAL)
			)
			// Left empty by default (not '333333') so the client picks a color
			// that follows the current dashboard theme (light/dark) automatically
			// - see CWidgetHoloztekMonitoringMap#resolveFontColor(). Set explicitly here
			// only to override that auto-detection.
			->addField(
				new CWidgetFieldColor('node_font_color', _holoztek_mm('Font color'))
			)
			->addField(
				(new CWidgetFieldColor('edge_color', _holoztek_mm('Edge color')))
					->setDefault('aac4d8')
			)
			->addField(
				(new CWidgetFieldIntegerBox('edge_width', _holoztek_mm('Edge width (px)'), 1, 8))
					->setDefault(1)
			)
			->addField(
				(new CWidgetFieldIntegerBox('drag_follow_hops', _holoztek_mm('Drag follow hops'), 0, 10))
					->setDefault(6)
			)
			// 0: the layout is shown once done. Otherwise it is shown after this
			// many iterations and spreads out on screen from there.
			->addField(
				(new CWidgetFieldIntegerBox('layout_iterations', _holoztek_mm('Layout iterations before display'), 0, 1000))
					->setDefault(0)
			)
			->addField(
				(new CWidgetFieldRadioButtonList('filter_position', _holoztek_mm('Filter icon position'),
					self::filterPositionValues()
				))
					->setDefault(self::FILTER_POSITION_TOP_RIGHT)
			)
			->addField(
				new CWidgetFieldCheckBoxList('backend_components', _holoztek_mm('Backend components'),
					self::backendComponentValues()
				)
			)
			// Used only with APM on; kept editable otherwise, like the APM option on 7.0.
			->addField(
				(new CWidgetFieldOtelWindow('otel_observation_window', _holoztek_mm('OTel observation window (minutes)'),
					HOLOZTEK_MM_OTEL_WINDOW_MIN, HOLOZTEK_MM_OTEL_WINDOW_MAX
				))
					->setDefault(HOLOZTEK_MM_OTEL_WINDOW_DEFAULT)
			);

		// On by default, which is also what dashboards saved before the setting get.
		foreach (self::DEFAULT_RELATION_FIELDS as $name => $caption) {
			$this->addField(
				(new CWidgetFieldCheckBox($name, _holoztek_mm('Default relation visibility'), _holoztek_mm($caption)))
					->setDefault(1)
			);
		}

		return $this;
	}
}
