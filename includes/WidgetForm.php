<?php declare(strict_types = 0);

namespace Modules\MonitoringMap\Includes;

use CWidgetsData;

use Zabbix\Widgets\CWidgetForm;

use Zabbix\Widgets\Fields\{
	CWidgetFieldColor,
	CWidgetFieldIntegerBox,
	CWidgetFieldMultiSelectGroup,
	CWidgetFieldMultiSelectHost,
	CWidgetFieldSelect,
	CWidgetFieldTextBox
};

class WidgetForm extends CWidgetForm {

	public const FONT_STYLE_NORMAL = 0;
	public const FONT_STYLE_BOLD   = 1;
	public const FONT_STYLE_ITALIC = 2;

	private static function fontStyleValues(): array {
		return [
			self::FONT_STYLE_NORMAL => _mm('Normal'),
			self::FONT_STYLE_BOLD   => _mm('Bold'),
			self::FONT_STYLE_ITALIC => _mm('Italic'),
		];
	}

	public function addFields(): self {
		return $this
			// Broadcast-receive only: preventDefault() hides the manual host/group
			// pick controls, leaving only the "receive from widget" connector in the
			// edit form. Selection is driven entirely by Tree Navigator etc.; with no
			// broadcast received, WidgetView must render the empty state, never a
			// stale manual pick.
			->addField(
				(new CWidgetFieldMultiSelectHost('hostid', _mm('Host')))
					->setMultiple(false)
					->setInType(CWidgetsData::DATA_TYPE_HOST_ID)
					->preventDefault()
					->acceptWidget()
			)
			->addField(
				(new CWidgetFieldMultiSelectGroup('hostgroupid', _mm('Host group')))
					->setMultiple(false)
					->setInType(CWidgetsData::DATA_TYPE_HOST_GROUP_ID)
					->preventDefault()
					->acceptWidget()
			)
			->addField(
				(new CWidgetFieldIntegerBox('subnet_prefix_length', _mm('Subnet prefix length'), 1, 32))
					->setDefault(24)
			)
			->addField(
				(new CWidgetFieldTextBox('server_label', _mm('Zabbix Server label')))
					->setDefault('Zabbix Server')
			)
			->addField(
				(new CWidgetFieldIntegerBox('node_font_size', _mm('Font size (px)'), 8, 24))
					->setDefault(12)
			)
			->addField(
				(new CWidgetFieldSelect('node_font_style', _mm('Style'), self::fontStyleValues()))
					->setDefault(self::FONT_STYLE_NORMAL)
			)
			->addField(
				(new CWidgetFieldColor('edge_color', _mm('Edge color')))
					->setDefault('aac4d8')
			)
			->addField(
				(new CWidgetFieldIntegerBox('edge_width', _mm('Edge width (px)'), 1, 8))
					->setDefault(1)
			);
	}
}
