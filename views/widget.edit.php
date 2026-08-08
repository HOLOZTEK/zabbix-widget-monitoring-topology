<?php declare(strict_types = 0);

/**
 * Monitoring Map widget configuration form.
 *
 * @var CView  $this
 * @var array  $data
 */

// 'hostid'/'hostgroupid' use preventDefault() in WidgetForm.php, so these
// render only the "receive from widget" connector control (Tree Navigator
// etc.), not a manual host/group-selection popup.

(new CWidgetFormView($data))
	->addField(
		new CWidgetFieldMultiSelectHostView($data['fields']['hostid'])
	)
	->addField(
		new CWidgetFieldMultiSelectGroupView($data['fields']['hostgroupid'])
	)
	->addField(
		new CWidgetFieldIntegerBoxView($data['fields']['subnet_prefix_length'])
	)
	->addField(
		new CWidgetFieldTextBoxView($data['fields']['server_label'])
	)
	->addField(
		new CWidgetFieldIntegerBoxView($data['fields']['node_font_size'])
	)
	->addField(
		new CWidgetFieldSelectView($data['fields']['node_font_style'])
	)
	->addField(
		new CWidgetFieldColorView($data['fields']['node_font_color'])
	)
	->addField(
		new CWidgetFieldColorView($data['fields']['edge_color'])
	)
	->addField(
		new CWidgetFieldIntegerBoxView($data['fields']['edge_width'])
	)
	->addField(
		new CWidgetFieldRadioButtonListView($data['fields']['filter_position'])
	)
	->includeJsFile('widget.edit.js.php')
	->addJavaScript('widget_monitoringmap_form.init();')
	->show();
