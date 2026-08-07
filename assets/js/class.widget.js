'use strict';

class CWidgetMonitoringMap extends CWidget {

	// Device-type icons, keyed by host device_type and used for host nodes
	// only. 'network' is a switch/router glyph (same design as the Tree
	// Navigator widget's device-type icon for network equipment hosts) - it
	// must stay visually distinct from #DEVICE_ICON.subnet below, which is the
	// cloud used for the topology's synthetic Network (subnet) waypoint nodes.
	// Conflating the two previously made network-equipment hosts render with
	// the subnet cloud icon.
	static #DEVICE_ICON = {
		server:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nMi41JyB3aWR0aD0nMTgnIGhlaWdodD0nNScgcng9JzEnIGZpbGw9JyNkZGUzZTgnIHN0cm9rZT0nIzQ0NScgc3Ryb2tlLXdpZHRoPScxLjQnLz48cmVjdCB4PScxJyB5PSc5LjUnIHdpZHRoPScxOCcgaGVpZ2h0PSc1JyByeD0nMScgZmlsbD0nI2RkZTNlOCcgc3Ryb2tlPScjNDQ1JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxjaXJjbGUgY3g9JzE2LjUnIGN5PSc1JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxNi41JyBjeT0nMTInIHI9JzEuMScgZmlsbD0nIzI3YTA0MCcvPjxyZWN0IHg9JzMnIHk9JzQuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PHJlY3QgeD0nMycgeT0nMTEuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PC9zdmc+",
		linux:   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTMuNScgcng9JzUnIHJ5PSc2JyBmaWxsPScjMjIzMDNhJy8+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTQuNScgcng9JzIuOCcgcnk9JzQnIGZpbGw9JyNkOGRmZTMnLz48Y2lyY2xlIGN4PScxMCcgY3k9JzYnIHI9JzQuNScgZmlsbD0nIzIyMzAzYScvPjxjaXJjbGUgY3g9JzguMycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nMTEuNycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nOC4zJyBjeT0nNS41JyByPScuNicgZmlsbD0nIzExMScvPjxjaXJjbGUgY3g9JzExLjcnIGN5PSc1LjUnIHI9Jy42JyBmaWxsPScjMTExJy8+PHBvbHlnb24gcG9pbnRzPSc5LjIsNy4zIDEwLjgsNy4zIDEwLDguNycgZmlsbD0nI2UwNjAwMCcvPjwvc3ZnPg==",
		windows: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMS41JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxLjUnIHk9JzEwLjcnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxMC43JyB3aWR0aD0nNy44JyBoZWlnaHQ9JzcuOCcgcng9Jy44JyBmaWxsPScjMDA5MGNjJy8+PC9zdmc+",
		network: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nNicgd2lkdGg9JzE4JyBoZWlnaHQ9JzcnIHJ4PScxJyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGNpcmNsZSBjeD0nNC41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PSc4JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxMS41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyM3NzgnLz48Y2lyY2xlIGN4PScxNScgY3k9JzkuNScgcj0nMS4xJyBmaWxsPScjNzc4Jy8+PGxpbmUgeDE9JzQuNScgeTE9JzEzJyB4Mj0nNC41JyB5Mj0nMTcnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nOCcgeTE9JzEzJyB4Mj0nOCcgeTI9JzE3JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGxpbmUgeDE9JzExLjUnIHkxPScxMycgeDI9JzExLjUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxsaW5lIHgxPScxNScgeTE9JzEzJyB4Mj0nMTUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjwvc3ZnPg==",
		virtual: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nNCcgeT0nMicgd2lkdGg9JzE0JyBoZWlnaHQ9JzEwJyByeD0nMScgZmlsbD0nI2M1Y2FlOCcgc3Ryb2tlPScjNWM2YmMwJyBzdHJva2Utd2lkdGg9JzEuMicvPjxyZWN0IHg9JzInIHk9JzUnIHdpZHRoPScxNCcgaGVpZ2h0PScxMCcgcng9JzEnIGZpbGw9JyNlZWYnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nNCcgeTE9JzEwJyB4Mj0nMTQnIHkyPScxMCcgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PGxpbmUgeDE9JzknIHkxPSc1LjUnIHgyPSc5JyB5Mj0nMTQuNScgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PC9zdmc+",
		subnet:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHBhdGggZD0nTTUuNiwxNS4zIEMzLjIsMTUuMyAxLjMsMTMuNSAxLjMsMTEuMyBDMS4zLDkuMiAyLjksNy41IDUsNy4zIEM1LjQsNC43IDcuNiwyLjcgMTAuMiwyLjcgQzEzLDIuNyAxNS4zLDQuOCAxNS42LDcuNSBDMTcuNSw3LjcgMTksOS4zIDE5LDExLjIgQzE5LDEzLjQgMTcuMSwxNS4zIDE0LjcsMTUuMyBaJyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnLz48L3N2Zz4=",
	};

	// Node-type glyphs (distinct from the host device-type icons above), used
	// for Server/Proxy/Network nodes now that the icon background no longer
	// encodes node type (it encodes problem severity instead - see #buildIcon).
	static #TYPE_ICON = {
		// Root Zabbix Server node: badge with "Z", filled with the Zabbix
		// brand red so this node reads as "Zabbix itself" at a glance.
		zbxserver: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPlo8L3RleHQ+PC9zdmc+",
		// Proxy node: badge with "P", same red/white design as the Server badge.
		proxy: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPlA8L3RleHQ+PC9zdmc+",
		// Proxy node, unresponsive: badge with "P" in gray/black instead of the
		// normal red/white, so an unreachable Proxy is visually distinct from a
		// healthy one at a glance (see meta.proxy_unresponsive in #buildIcon).
		proxy_offline: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2JkYmRiZCcgc3Ryb2tlPScjNmU2ZTZlJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyMwMDAnPlA8L3RleHQ+PC9zdmc+",
		// Proxy Group node: badge with "G", same red/white design as the Server badge.
		proxy_group: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMicgeT0nMicgd2lkdGg9JzE2JyBoZWlnaHQ9JzE2JyByeD0nMycgZmlsbD0nI2Q0MDAwMCcgc3Ryb2tlPScjYTMwMDAwJyBzdHJva2Utd2lkdGg9JzEuNCcvPjx0ZXh0IHg9JzEwJyB5PScxNC44JyBmb250LXNpemU9JzEyJyBmb250LWZhbWlseT0nc2Fucy1zZXJpZicgZm9udC13ZWlnaHQ9J2JvbGQnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNmZmYnPkc8L3RleHQ+PC9zdmc+",
	};

	// Communication-method badges: rendered as small colored/lettered circles
	// composited onto the host icon (vis-network only supports one image per
	// node, so badges can't be separate overlay nodes).
	static #COMM_BADGE = {
		ping:   { letter: 'P', color: '#2ecc71' },
		snmp:   { letter: 'S', color: '#3498db' },
		agent:  { letter: 'A', color: '#9b59b6' },
		ipmi:   { letter: 'I', color: '#e67e22' },
		vmware: { letter: 'V', color: '#1abc9c' },
		odbc:   { letter: 'O', color: '#e74c3c' },
		jmx:    { letter: 'J', color: '#f39c12' },
	};

	static #NODE_TYPE_LABEL = {
		server:      'Zabbix Server',
		proxy_group: 'Proxy Group',
		proxy:       'Zabbix Proxy',
		network:     'Network',
		host:        'Host',
	};

	static #COMM_METHOD_LABEL = {
		ping:   'Ping',
		snmp:   'SNMP',
		agent:  'Agent',
		ipmi:   'IPMI',
		vmware: 'VMware',
		odbc:   'ODBC',
		jmx:    'JMX',
	};

	#network      = null;
	#nodesDS      = null;
	#edgesDS      = null;
	#nodesMeta    = {};
	#iconCache    = {};
	#s            = {};
	#popupAnchor  = null;
	#children     = {};
	#highlightedProxy = null;

	onInitialize() {
		this._dom_id_suffix = '';
	}

	hasPadding() {
		return false;
	}

	getUpdateRequestData() {
		const data = super.getUpdateRequestData();
		data.widget_unique_id = this.getUniqueId();
		return data;
	}

	setContents(response) {
		super.setContents(response);

		if (response.dom_id_suffix !== undefined) this._dom_id_suffix = response.dom_id_suffix;

		this.#initGraph();
	}

	onClearContents() {
		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}
		this.#children = {};
		this.#highlightedProxy = null;
	}

	// ── graph ─────────────────────────────────────────────────────────────────

	#initGraph() {
		const container = this._body.querySelector('.js-mm-container');
		if (!container) return;

		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}

		this.#children = {};
		this.#highlightedProxy = null;

		let elements;
		try {
			elements = JSON.parse(container.dataset.elements || '[]');
		} catch (_) {
			elements = [];
		}

		if (elements.length === 0) return;

		this.#s = {
			fontSize:   parseInt(container.dataset.nodeFontSize  || '12', 10),
			fontWeight: parseInt(container.dataset.nodeFontStyle || '0', 10) === 1 ? 'bold'   : 'normal',
			fontStyle:  parseInt(container.dataset.nodeFontStyle || '0', 10) === 2 ? 'italic' : 'normal',
			edgeWidth:  parseFloat(container.dataset.edgeWidth || '1'),
			edgeColor:  container.dataset.edgeColor     || '#aac4d8',
		};

		const visNodes = [];
		const visEdges = [];
		this.#nodesMeta = {};
		this.#iconCache = {};

		elements.forEach(el => {
			if (el.data.source) {
				(this.#children[el.data.source] ??= []).push(el.data.target);
				visEdges.push({
					id:    el.data.source + '__' + el.data.target,
					from:  el.data.source,
					to:    el.data.target,
					// vis-network defaults edges.color.inherit to 'from', which makes
					// an edge take its connected node's color instead of this
					// explicit one unless disabled here.
					color: { color: this.#s.edgeColor, highlight: this.#s.edgeColor, inherit: false },
					width: this.#s.edgeWidth,
					smooth: { type: 'continuous' },
				});
				return;
			}

			const meta = {
				node_type:          el.data.type,
				device_type:        el.data.device_type || 'server',
				comm_methods:       el.data.comm_methods || [],
				severity_color:     el.data.severity_color || null,
				severity_label:     el.data.severity_label || null,
				proxy_unresponsive: el.data.proxy_unresponsive || false,
			};
			this.#nodesMeta[el.data.id] = meta;

			visNodes.push({
				id:    el.data.id,
				label: el.data.label,
				shape: 'image',
				image: this.#buildIcon(meta),
				color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
				font: {
					color: '#333333',
					size:  this.#s.fontSize,
					bold:  this.#s.fontWeight === 'bold' ? { size: this.#s.fontSize, vadjust: 0 } : false,
					ital:  this.#s.fontStyle === 'italic',
				},
			});
		});

		this.#nodesDS = new vis.DataSet(visNodes);
		this.#edgesDS = new vis.DataSet(visEdges);

		this.#network = new vis.Network(container, {
			nodes: this.#nodesDS,
			edges: this.#edgesDS,
		}, {
			physics: {
				solver: 'barnesHut',
				barnesHut: {
					gravitationalConstant: -8000,
					centralGravity:        0.3,
					springLength:          130,
					springConstant:        0.04,
					damping:               0.09,
				},
				stabilization: { iterations: 150, fit: true },
			},
			interaction: {
				hover:        true,
				tooltipDelay: 200,
				hideEdgesOnDrag: true,
			},
			layout: { improvedLayout: true },
		});

		this.#network.on('click', (params) => {
			if (params.nodes.length === 0) {
				this.#resetEdgeHighlight();
				return;
			}

			const nodeId = params.nodes[0];
			const meta   = this.#nodesMeta[nodeId];
			if (!meta) return;

			if (meta.node_type === 'host') {
				this.#hideTooltip();
				const hostid = nodeId.replace(/^h_/, '');
				this.#showHostMenu(hostid, this.#makePopupEvent(params));
				return;
			}

			if (meta.node_type === 'proxy') {
				this.#toggleProxyHighlight(nodeId);
				return;
			}

			this.#resetEdgeHighlight();
		});

		this.#network.on('hoverNode', (params) => {
			const meta = this.#nodesMeta[params.node];
			if (!meta) return;
			const node = this.#nodesDS.get(params.node);
			this.#showTooltip(node ? node.label : params.node, meta);
		});

		this.#network.on('blurNode', () => this.#hideTooltip());
	}

	// Emergency fallback only, for Host nodes - the server always sends a
	// severity_color for every host (see WidgetView::applySeverities()), so
	// this path isn't normally reached. Server/Proxy Group/Proxy/Network don't
	// use this at all (see #buildIcon's bgColor).
	#colorForType() {
		return '#6a8da8';
	}

	// Thickens every edge on the path from a Proxy node down to the hosts it
	// monitors (Proxy -> Network -> Host), so the whole reachable subtree is
	// visually traceable. Clicking the same Proxy again clears it.
	#toggleProxyHighlight(proxyId) {
		if (this.#highlightedProxy === proxyId) {
			this.#resetEdgeHighlight();
			return;
		}

		const highlighted = new Set();
		const stack = [proxyId];
		while (stack.length > 0) {
			const id = stack.pop();
			for (const child of this.#children[id] || []) {
				highlighted.add(id + '__' + child);
				stack.push(child);
			}
		}

		const baseWidth = this.#s.edgeWidth;
		const highlightWidth = baseWidth * 3 + 2;

		this.#edgesDS.update(this.#edgesDS.get().map(edge => ({
			id:    edge.id,
			width: highlighted.has(edge.id) ? highlightWidth : baseWidth,
		})));

		this.#highlightedProxy = proxyId;
	}

	#resetEdgeHighlight() {
		if (!this.#edgesDS || this.#highlightedProxy === null) return;

		const baseWidth = this.#s.edgeWidth;
		this.#edgesDS.update(this.#edgesDS.get().map(edge => ({ id: edge.id, width: baseWidth })));
		this.#highlightedProxy = null;
	}

	/**
	 * Zabbix's menu popup positions itself relative to a real DOM element.
	 * Vis Network nodes are canvas-drawn, not DOM elements, so we drop an
	 * invisible anchor at the click point and use that as the popup's
	 * reference element instead of computing pageX/pageY by hand.
	 */
	#makePopupEvent(params) {
		if (!this.#popupAnchor) {
			this.#popupAnchor = document.createElement('span');
			this.#popupAnchor.style.cssText = 'position:fixed;width:0;height:0;pointer-events:none;';
			document.body.appendChild(this.#popupAnchor);
		}

		const canvas = this.#network.canvas.frame.canvas;
		const rect   = canvas.getBoundingClientRect();

		this.#popupAnchor.style.left = `${rect.left + params.pointer.DOM.x}px`;
		this.#popupAnchor.style.top  = `${rect.top  + params.pointer.DOM.y}px`;

		return {
			type: 'click',
			originalEvent: { detail: 0 },
			target: this.#popupAnchor
		};
	}

	#showHostMenu(hostid, event) {
		const $obj = $(event.target);

		$.ajax({
			url: 'zabbix.php?action=menu.popup&type=host',
			method: 'POST',
			data: { data: { hostid } },
			dataType: 'json'
		}).done((resp) => {
			if (!resp || 'error' in resp) return;
			$obj.menuPopup(getMenuPopupHost(resp.data, $obj), event, {});
		});
	}

	// Composites a colored background circle (problem severity - see
	// meta.severity_color, computed server-side from active Problems / Zabbix's
	// configured severity colors), a node-type/device-type glyph, and, for
	// hosts, a row of communication-method badges into a single SVG, then
	// returns it as a base64 data URI (vis-network's 'image' shape only
	// supports one image per node).
	#buildIcon(meta) {
		const cacheKey = `${meta.node_type}|${meta.device_type}|${meta.severity_color}|${meta.proxy_unresponsive}|${(meta.comm_methods || []).join(',')}`;
		if (this.#iconCache[cacheKey]) return this.#iconCache[cacheKey];

		// Only Host nodes carry a severity color (see WidgetView::applySeverities()) -
		// Server/Proxy Group/Proxy/Network aren't monitored objects with Problems
		// of their own, so they skip this background circle entirely and show
		// only their own badge/glyph (drawn below), instead of doubling up with
		// a same-colored circle behind it.
		const bgColor = meta.node_type === 'host'
			? (meta.severity_color || this.#colorForType())
			: 'none';
		const deviceIcon = meta.node_type === 'host'
			? (CWidgetMonitoringMap.#DEVICE_ICON[meta.device_type] || CWidgetMonitoringMap.#DEVICE_ICON.server)
			: meta.node_type === 'network'
				? CWidgetMonitoringMap.#DEVICE_ICON.subnet
				: meta.node_type === 'proxy' && meta.proxy_unresponsive
					? CWidgetMonitoringMap.#TYPE_ICON.proxy_offline
					: (CWidgetMonitoringMap.#TYPE_ICON[meta.node_type] || CWidgetMonitoringMap.#TYPE_ICON.zbxserver);

		const badges = (meta.comm_methods || []).map((method, i) => {
			const badge = CWidgetMonitoringMap.#COMM_BADGE[method];
			if (!badge) return '';
			const cx = 8 + i * 9;
			const cy = 36;
			return `<circle cx="${cx}" cy="${cy}" r="4.3" fill="${badge.color}" stroke="#fff" stroke-width="0.6"/>`
				+ `<text x="${cx}" y="${cy + 1.8}" font-size="5.5" font-family="sans-serif" font-weight="bold" `
				+ `text-anchor="middle" fill="#fff">${badge.letter}</text>`;
		}).join('');

		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">`
			+ `<circle cx="20" cy="17" r="15" fill="${bgColor}"/>`
			+ `<image href="${deviceIcon}" x="9" y="6" width="22" height="22"/>`
			+ badges
			+ `</svg>`;

		const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
		this.#iconCache[cacheKey] = dataUri;
		return dataUri;
	}

	// ── tooltip ───────────────────────────────────────────────────────────────

	#showTooltip(label, meta) {
		let box = document.getElementById('mm-vis-tooltip');
		if (!box) {
			box = document.createElement('div');
			box.id = 'mm-vis-tooltip';
			box.style.cssText = 'position:fixed;background:#1d2228;color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;pointer-events:none;z-index:99999;line-height:1.5;box-shadow:0 2px 8px rgba(0,0,0,.4)';
			document.body.appendChild(box);
		}

		const typeLabel = t(CWidgetMonitoringMap.#NODE_TYPE_LABEL[meta.node_type] || meta.node_type);
		let html = `<strong>${this.#escape(label)}</strong><br><span style="opacity:.7">${typeLabel}</span>`;

		if (meta.severity_label) {
			html += `<br><span style="opacity:.7">${t('Severity')}: ${this.#escape(meta.severity_label)}</span>`;
		}

		if (meta.node_type === 'proxy' && meta.proxy_unresponsive) {
			html += `<br><span style="opacity:.7">${t('Status')}: ${t('Not responding')}</span>`;
		}

		if (meta.node_type === 'host' && meta.comm_methods && meta.comm_methods.length > 0) {
			const names = meta.comm_methods.map(m => CWidgetMonitoringMap.#COMM_METHOD_LABEL[m] || m).join(', ');
			html += `<br><span style="opacity:.7">${t('Communication method')}: ${this.#escape(names)}</span>`;
		}

		box.innerHTML = html;
		box.style.display = 'block';

		const updatePos = (e) => {
			box.style.left = (e.clientX + 12) + 'px';
			box.style.top  = (e.clientY - 6)  + 'px';
		};
		document.addEventListener('mousemove', updatePos);
		box._cleanup = () => document.removeEventListener('mousemove', updatePos);
	}

	#hideTooltip() {
		const box = document.getElementById('mm-vis-tooltip');
		if (box) {
			box.style.display = 'none';
			if (box._cleanup) { box._cleanup(); box._cleanup = null; }
		}
	}

	#escape(str) {
		return String(str).replace(/[&<>"']/g, (c) => ({
			'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
		}[c]));
	}
}
