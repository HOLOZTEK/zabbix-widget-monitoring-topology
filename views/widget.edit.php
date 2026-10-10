<?php declare(strict_types = 0);

/**
 * Monitoring Map widget configuration form.
 *
 * @var CView  $this
 * @var array  $data
 */

// 'hostid' uses preventDefault() in WidgetForm.php, so it renders only the
// "receive from widget" connector control (Tree Navigator etc.). 'hostgroupid'
// accepts several fixed host groups as well as a widget reference.

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
	->addJavaScript('holoztek_monitoringmap_form.init();')
	->show();
