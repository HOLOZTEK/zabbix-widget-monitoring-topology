<?php declare(strict_types = 0);

/**
 * Monitoring Map widget configuration form.
 *
 * @var CView  $this
 * @var array  $data
 */

use Modules\HoloztekMonitoringMap\Includes\WidgetForm;

// 'hostid' uses preventDefault() in WidgetForm.php, so it renders only the
// "receive from widget" connector control (Tree Navigator etc.). 'hostgroupid'
// accepts several fixed host groups as well as a widget reference.

$form = new CWidgetFormView($data);

// Tabs only group the fields: names and saved values are as before.
$tabs = [
	'monitoring' => [
		// Not 'Monitoring': that string is the relation, translated as such.
		'label'  => _holoztek_mm('Monitoring targets'),
		'fields' => [
			new CWidgetFieldMultiSelectHostView($data['fields']['hostid']),
			new CWidgetFieldMultiSelectGroupView($data['fields']['hostgroupid']),
			new CWidgetFieldIntegerBoxView($data['fields']['subnet_prefix_length']),
			new CWidgetFieldTextBoxView($data['fields']['server_label'])
		]
	],
	'backend' => [
		'label'  => _holoztek_mm('Backend / APM'),
		'fields' => [
			(new CWidgetFieldCheckBoxListView($data['fields']['backend_components']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Decides what is fetched. Database adds the Zabbix and Proxy databases; APM queries APM trace data.'), BR(),
					_holoztek_mm('The relation filter on the dashboard only shows or hides what was fetched.')
				])),
			(new CWidgetFieldIntegerBoxView($data['fields']['otel_observation_window']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Displays OpenTelemetry services and systems observed within this period.'), BR(),
					_holoztek_mm('A longer period keeps low-frequency telemetry sources visible.')
				]))
		]
	],
	'display' => [
		'label'  => _holoztek_mm('Display'),
		'fields' => [
			new CWidgetFieldIntegerBoxView($data['fields']['node_font_size']),
			new CWidgetFieldSelectView($data['fields']['node_font_style']),
			new CWidgetFieldColorView($data['fields']['node_font_color']),
			new CWidgetFieldColorView($data['fields']['edge_color']),
			new CWidgetFieldIntegerBoxView($data['fields']['edge_width']),
			new CWidgetFieldIntegerBoxView($data['fields']['drag_follow_hops']),
			(new CWidgetFieldIntegerBoxView($data['fields']['layout_iterations']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('0: the topology is shown once its layout is done.'), BR(),
					_holoztek_mm('1 or more: the topology is shown after this many layout iterations and spreads out on screen until it settles. The smaller the value, the more it moves.'), BR(),
					_holoztek_mm('Applies when the topology is laid out anew: on first display, when the selection changes, or when the topology changes substantially.')
				])),
			new CWidgetFieldRadioButtonListView($data['fields']['filter_position'])
		]
	]
];

$form_tabs = (new CTabView(['id' => 'mm_config_tabs']))->addClass('mm-config-tabs');

foreach ($tabs as $tab_id => $tab) {
	$form_grid = new CFormGrid();

	foreach ($tab['fields'] as $field_view) {
		$form->registerField($field_view);

		foreach ($field_view->getViewCollection() as ['label' => $label, 'view' => $view, 'class' => $class]) {
			$form_grid->addItem([$label, (new CFormField($view))->addClass($class)]);
		}
	}

	// Four checkbox fields under one label: where the relation filter starts.
	if ($tab_id === 'display') {
		$relations = (new CDiv())->addClass('mm-default-relations');

		foreach (array_keys(WidgetForm::DEFAULT_RELATION_FIELDS) as $name) {
			$field_view = new CWidgetFieldCheckBoxView($data['fields'][$name]);
			$form->registerField($field_view);
			$relations->addItem(new CDiv($field_view->getView()));
		}

		$form_grid->addItem([
			new CLabel([
				_holoztek_mm('Default relation visibility'),
				makeHelpIcon([
					_holoztek_mm('Where the relation filter starts each time the dashboard is opened. Changes made in the filter are kept on refresh, not saved.'), BR(),
					_holoztek_mm('Relations not fetched (see Backend components) stay off.')
				])
			]),
			new CFormField($relations)
		]);
	}

	$form_tabs->addTab('mm_tab_'.$tab_id, $tab['label'], $form_grid);
}

$form_tabs->setSelected(0);

$form
	->addItem($form_tabs)
	->addJavaScript($form_tabs->makeJavascript())
	->includeJsFile('widget.edit.js.php')
	->addJavaScript('holoztek_monitoringmap_form.init('.json_encode([
		'form_tabs_id'      => $form_tabs->getId(),
		'relation_backends' => [
			'default_rel_database'    => WidgetForm::BACKEND_DATABASE,
			'default_rel_apm_storage' => WidgetForm::BACKEND_APM,
			'default_rel_telemetry'   => WidgetForm::BACKEND_APM
		],
		// APM is listed on 7.0 too, but fetched only on 8.0 and later.
		'available_backends' => holoztek_mm_apm_supported()
			? [WidgetForm::BACKEND_DATABASE, WidgetForm::BACKEND_APM]
			: [WidgetForm::BACKEND_DATABASE]
	]).');')
	->show();
