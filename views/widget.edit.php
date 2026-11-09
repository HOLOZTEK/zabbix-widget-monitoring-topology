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
// Monitoring: what the Topology is built from. Data acquisition: what is
// fetched. Display: how it is drawn and which components it starts with.
$tabs = [
	'monitoring' => [
		// 'Monitoring targets' in the source: 'Monitoring' is the relation, translated as such.
		'label'    => _holoztek_mm('Monitoring targets'),
		'sections' => [[null, [
			new CWidgetFieldMultiSelectHostView($data['fields']['hostid']),
			new CWidgetFieldMultiSelectGroupView($data['fields']['hostgroupid']),
			new CWidgetFieldIntegerBoxView($data['fields']['subnet_prefix_length']),
			new CWidgetFieldTextBoxView($data['fields']['server_label'])
		]]]
	],
	'acquisition' => [
		'label'    => _holoztek_mm('Data acquisition'),
		'sections' => [[null, [
			(new CWidgetFieldCheckBoxListView($data['fields']['backend_components']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Decides what is fetched. Database adds the Zabbix and Proxy databases; APM queries APM trace data.'), BR(),
					_holoztek_mm('The Components and Relations filters on the dashboard only show or hide what was fetched.')
				])),
			(new CWidgetFieldIntegerBoxView($data['fields']['otel_observation_window']))
				->setFieldHint(makeHelpIcon([
					_holoztek_mm('Displays OpenTelemetry services and systems observed within this period.'), BR(),
					_holoztek_mm('A longer period keeps low-frequency telemetry sources visible.')
				]))
		]]]
	],
	'display' => [
		'label'    => _holoztek_mm('Display'),
		'sections' => [
			[_holoztek_mm('Drawing'), [
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
			]],
			// Filled in below: three checkbox fields under one label.
			[_holoztek_mm('Default visibility'), []]
		]
	]
];

$form_tabs = (new CTabView(['id' => 'mm_config_tabs']))->addClass('mm-config-tabs');

foreach ($tabs as $tab_id => $tab) {
	$tab_body = [];

	foreach ($tab['sections'] as [$caption, $field_views]) {
		$form_grid = new CFormGrid();

		foreach ($field_views as $field_view) {
			$form->registerField($field_view);

			foreach ($field_view->getViewCollection() as ['label' => $label, 'view' => $view, 'class' => $class]) {
				$form_grid->addItem([$label, (new CFormField($view))->addClass($class)]);
			}
		}

		// Where the Components filter starts.
		if ($caption !== null && !$field_views) {
			$components = (new CDiv())->addClass('mm-default-components');

			foreach (array_keys(WidgetForm::DEFAULT_COMPONENT_FIELDS) as $name) {
				$field_view = new CWidgetFieldCheckBoxView($data['fields'][$name]);
				$form->registerField($field_view);
				$components->addItem(new CDiv($field_view->getView()));
			}

			$form_grid->addItem([
				new CLabel([
					_holoztek_mm('Default component visibility'),
					makeHelpIcon([
						_holoztek_mm('Where the Components filter starts each time the dashboard is opened. Changes made in the filter are kept on refresh, not saved.'), BR(),
						_holoztek_mm('Components not fetched (see Data acquisition) stay off. Hiding a component does not stop it being fetched.')
					])
				]),
				new CFormField($components)
			]);
		}

		$tab_body[] = $caption === null
			? $form_grid
			: (new CFormFieldset($caption, $form_grid))->addClass('mm-config-section');
	}

	$form_tabs->addTab('mm_tab_'.$tab_id, $tab['label'], count($tab_body) === 1 ? $tab_body[0] : new CDiv($tab_body));
}

$form_tabs->setSelected(0);

$form
	->addItem($form_tabs)
	->addJavaScript($form_tabs->makeJavascript())
	->includeJsFile('widget.edit.js.php')
	->addJavaScript('holoztek_monitoringmap_form.init('.json_encode([
		'form_tabs_id'      => $form_tabs->getId(),
		'component_backends' => [
			'default_comp_database'      => WidgetForm::BACKEND_DATABASE,
			'default_comp_apm_datastore' => WidgetForm::BACKEND_APM,
			'default_comp_opentelemetry' => WidgetForm::BACKEND_APM
		],
		// APM is listed on 7.0 too, but fetched only on 8.0 and later.
		'available_backends' => holoztek_mm_apm_supported()
			? [WidgetForm::BACKEND_DATABASE, WidgetForm::BACKEND_APM]
			: [WidgetForm::BACKEND_DATABASE]
	]).');')
	->show();
