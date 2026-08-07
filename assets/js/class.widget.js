'use strict';

class CWidgetMonitoringMap extends CWidget {

	// Device-type icons, ported as-is from the base topologymap-visnetwork
	// widget's #ICON. Reused both for host nodes (keyed by device_type) and,
	// for the 'network' entry, as the icon for network (subnet) nodes.
	static #DEVICE_ICON = {
		server:  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nMi41JyB3aWR0aD0nMTgnIGhlaWdodD0nNScgcng9JzEnIGZpbGw9JyNkZGUzZTgnIHN0cm9rZT0nIzQ0NScgc3Ryb2tlLXdpZHRoPScxLjQnLz48cmVjdCB4PScxJyB5PSc5LjUnIHdpZHRoPScxOCcgaGVpZ2h0PSc1JyByeD0nMScgZmlsbD0nI2RkZTNlOCcgc3Ryb2tlPScjNDQ1JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxjaXJjbGUgY3g9JzE2LjUnIGN5PSc1JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxNi41JyBjeT0nMTInIHI9JzEuMScgZmlsbD0nIzI3YTA0MCcvPjxyZWN0IHg9JzMnIHk9JzQuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PHJlY3QgeD0nMycgeT0nMTEuMycgd2lkdGg9JzEwJyBoZWlnaHQ9JzEuNCcgcng9Jy43JyBmaWxsPScjYWFiJy8+PC9zdmc+",
		linux:   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTMuNScgcng9JzUnIHJ5PSc2JyBmaWxsPScjMjIzMDNhJy8+PGVsbGlwc2UgY3g9JzEwJyBjeT0nMTQuNScgcng9JzIuOCcgcnk9JzQnIGZpbGw9JyNkOGRmZTMnLz48Y2lyY2xlIGN4PScxMCcgY3k9JzYnIHI9JzQuNScgZmlsbD0nIzIyMzAzYScvPjxjaXJjbGUgY3g9JzguMycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nMTEuNycgY3k9JzUuNScgcj0nMS4zJyBmaWxsPScjZjljNDAwJy8+PGNpcmNsZSBjeD0nOC4zJyBjeT0nNS41JyByPScuNicgZmlsbD0nIzExMScvPjxjaXJjbGUgY3g9JzExLjcnIGN5PSc1LjUnIHI9Jy42JyBmaWxsPScjMTExJy8+PHBvbHlnb24gcG9pbnRzPSc5LjIsNy4zIDEwLjgsNy4zIDEwLDguNycgZmlsbD0nI2UwNjAwMCcvPjwvc3ZnPg==",
		windows: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMS41JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxLjUnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxLjUnIHk9JzEwLjcnIHdpZHRoPSc3LjgnIGhlaWdodD0nNy44JyByeD0nLjgnIGZpbGw9JyMwMDkwY2MnLz48cmVjdCB4PScxMC43JyB5PScxMC43JyB3aWR0aD0nNy44JyBoZWlnaHQ9JzcuOCcgcng9Jy44JyBmaWxsPScjMDA5MGNjJy8+PC9zdmc+",
		network: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nMScgeT0nNicgd2lkdGg9JzE4JyBoZWlnaHQ9JzcnIHJ4PScxJyBmaWxsPScjY2RkNmRiJyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGNpcmNsZSBjeD0nNC41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PSc4JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyMyN2EwNDAnLz48Y2lyY2xlIGN4PScxMS41JyBjeT0nOS41JyByPScxLjEnIGZpbGw9JyM3NzgnLz48Y2lyY2xlIGN4PScxNScgY3k9JzkuNScgcj0nMS4xJyBmaWxsPScjNzc4Jy8+PGxpbmUgeDE9JzQuNScgeTE9JzEzJyB4Mj0nNC41JyB5Mj0nMTcnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nOCcgeTE9JzEzJyB4Mj0nOCcgeTI9JzE3JyBzdHJva2U9JyMzMzQnIHN0cm9rZS13aWR0aD0nMS40Jy8+PGxpbmUgeDE9JzExLjUnIHkxPScxMycgeDI9JzExLjUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjxsaW5lIHgxPScxNScgeTE9JzEzJyB4Mj0nMTUnIHkyPScxNycgc3Ryb2tlPScjMzM0JyBzdHJva2Utd2lkdGg9JzEuNCcvPjwvc3ZnPg==",
		virtual: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyMCAyMCc+PHJlY3QgeD0nNCcgeT0nMicgd2lkdGg9JzE0JyBoZWlnaHQ9JzEwJyByeD0nMScgZmlsbD0nI2M1Y2FlOCcgc3Ryb2tlPScjNWM2YmMwJyBzdHJva2Utd2lkdGg9JzEuMicvPjxyZWN0IHg9JzInIHk9JzUnIHdpZHRoPScxNCcgaGVpZ2h0PScxMCcgcng9JzEnIGZpbGw9JyNlZWYnIHN0cm9rZT0nIzMzNCcgc3Ryb2tlLXdpZHRoPScxLjQnLz48bGluZSB4MT0nNCcgeTE9JzEwJyB4Mj0nMTQnIHkyPScxMCcgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PGxpbmUgeDE9JzknIHkxPSc1LjUnIHgyPSc5JyB5Mj0nMTQuNScgc3Ryb2tlPScjODg5JyBzdHJva2Utd2lkdGg9Jy45Jy8+PC9zdmc+",
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
		server:  'Zabbix サーバー',
		proxy:   'Zabbix プロキシ',
		network: 'ネットワーク',
		host:    'ホスト',
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

	static #SHAPE_BY_TYPE = {
		server:  'hexagon',
		proxy:   'triangle',
		network: 'ellipse',
		host:    'box',
	};

	#network      = null;
	#nodesDS      = null;
	#edgesDS      = null;
	#nodesMeta    = {};
	#iconCache    = {};
	#s            = {};
	#display_mode = 'object';

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

		this.#display_mode = this.#loadMode();

		this.#initGraph();
		this.#applyNodeStyle();
		this.#bindModeToggle();
		this.#updateToggleUI();
	}

	onClearContents() {
		if (this.#network !== null) {
			this.#network.destroy();
			this.#network = null;
			this.#nodesDS = null;
			this.#edgesDS = null;
		}
	}

	// ── display mode ──────────────────────────────────────────────────────────

	get #storageKey() {
		return 'mm_mode_vis_' + this._widgetid;
	}

	#loadMode() {
		return localStorage.getItem(this.#storageKey) === 'icon' ? 'icon' : 'object';
	}

	#saveMode(mode) {
		localStorage.setItem(this.#storageKey, mode);
	}

	#bindModeToggle() {
		const objBtn  = this._body.querySelector('.js-mm-mode-object');
		const iconBtn = this._body.querySelector('.js-mm-mode-icon');
		if (objBtn)  objBtn.addEventListener('click',  () => this.#switchMode('object'));
		if (iconBtn) iconBtn.addEventListener('click', () => this.#switchMode('icon'));
	}

	#switchMode(mode) {
		if (this.#display_mode === mode) return;
		this.#display_mode = mode;
		this.#saveMode(mode);
		this.#updateToggleUI();
		this.#applyNodeStyle();
	}

	#updateToggleUI() {
		const objBtn  = this._body.querySelector('.js-mm-mode-object');
		const iconBtn = this._body.querySelector('.js-mm-mode-icon');
		if (objBtn)  objBtn.classList.toggle('mm-mode-active', this.#display_mode === 'object');
		if (iconBtn) iconBtn.classList.toggle('mm-mode-active', this.#display_mode === 'icon');
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

		let elements;
		try {
			elements = JSON.parse(container.dataset.elements || '[]');
		} catch (_) {
			elements = [];
		}

		if (elements.length === 0) return;

		this.#s = {
			serverColor:  container.dataset.serverColor  || '#c0392b',
			proxyColor:   container.dataset.proxyColor    || '#e08e0b',
			networkColor: container.dataset.networkColor  || '#7f8c8d',
			hostColor:    container.dataset.hostColor     || '#6a8da8',
			fontSize:     parseInt(container.dataset.nodeFontSize  || '12', 10),
			fontWeight:   parseInt(container.dataset.nodeFontStyle || '0', 10) === 1 ? 'bold'   : 'normal',
			fontStyle:    parseInt(container.dataset.nodeFontStyle || '0', 10) === 2 ? 'italic' : 'normal',
			edgeWidth:    parseFloat(container.dataset.edgeWidth || '1'),
			edgeColor:    container.dataset.edgeColor     || '#aac4d8',
		};

		const visNodes = [];
		const visEdges = [];
		this.#nodesMeta = {};
		this.#iconCache = {};

		elements.forEach(el => {
			if (el.data.source) {
				visEdges.push({
					id:    el.data.source + '__' + el.data.target,
					from:  el.data.source,
					to:    el.data.target,
					color: { color: this.#s.edgeColor, highlight: this.#s.edgeColor },
					width: this.#s.edgeWidth,
					smooth: { type: 'continuous' },
				});
				return;
			}

			const nodeType = el.data.type;
			const color = this.#colorForType(nodeType);

			visNodes.push({
				id:    el.data.id,
				label: el.data.label,
				shape: CWidgetMonitoringMap.#SHAPE_BY_TYPE[nodeType] || 'box',
				color: {
					background: color,
					border:     color,
					highlight:  { background: '#e8a020', border: '#e8a020' },
				},
				font: {
					color: '#ffffff',
					size:  this.#s.fontSize,
					bold:  this.#s.fontWeight === 'bold' ? { size: this.#s.fontSize, vadjust: 0 } : false,
					ital:  this.#s.fontStyle === 'italic',
				},
			});

			this.#nodesMeta[el.data.id] = {
				node_type:    nodeType,
				device_type:  el.data.device_type || 'server',
				comm_methods: el.data.comm_methods || [],
			};
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
			if (params.nodes.length === 0) return;
			const nodeId = params.nodes[0];
			const meta   = this.#nodesMeta[nodeId];
			if (meta && meta.node_type === 'host') {
				const hostid = nodeId.replace(/^h_/, '');
				window.open(`/zabbix.php?action=host.view&hostid=${hostid}`, '_blank');
			}
		});

		this.#network.on('hoverNode', (params) => {
			const meta = this.#nodesMeta[params.node];
			if (!meta) return;
			const node = this.#nodesDS.get(params.node);
			this.#showTooltip(node ? node.label : params.node, meta);
		});

		this.#network.on('blurNode', () => this.#hideTooltip());
	}

	#colorForType(nodeType) {
		switch (nodeType) {
			case 'server':  return this.#s.serverColor;
			case 'proxy':   return this.#s.proxyColor;
			case 'network': return this.#s.networkColor;
			default:        return this.#s.hostColor;
		}
	}

	#applyNodeStyle() {
		if (!this.#nodesDS) return;

		const updates = this.#nodesDS.get().map(node => {
			const meta = this.#nodesMeta[node.id] || {};
			if (this.#display_mode === 'icon') {
				return {
					id:    node.id,
					shape: 'image',
					image: this.#buildIcon(meta),
					color: { background: 'rgba(0,0,0,0)', border: 'rgba(0,0,0,0)' },
					font:  { color: '#333333' },
				};
			}

			const color = this.#colorForType(meta.node_type);
			return {
				id:    node.id,
				shape: CWidgetMonitoringMap.#SHAPE_BY_TYPE[meta.node_type] || 'box',
				image: undefined,
				color: {
					background: color,
					border:     color,
					highlight:  { background: '#e8a020', border: '#e8a020' },
				},
				font:  { color: '#ffffff' },
			};
		});
		this.#nodesDS.update(updates);
	}

	// Composites a colored background circle (per node type), the device-type
	// icon (host nodes only - server/proxy/network always show the 'server'
	// glyph), and, for hosts, a row of communication-method badges into a
	// single SVG, then returns it as a base64 data URI (vis-network's 'image'
	// shape only supports one image per node).
	#buildIcon(meta) {
		const cacheKey = `${meta.node_type}|${meta.device_type}|${(meta.comm_methods || []).join(',')}`;
		if (this.#iconCache[cacheKey]) return this.#iconCache[cacheKey];

		const bgColor  = this.#colorForType(meta.node_type);
		const deviceIcon = meta.node_type === 'host'
			? (CWidgetMonitoringMap.#DEVICE_ICON[meta.device_type] || CWidgetMonitoringMap.#DEVICE_ICON.server)
			: CWidgetMonitoringMap.#DEVICE_ICON[meta.node_type === 'network' ? 'network' : 'server'];

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

		const typeLabel = CWidgetMonitoringMap.#NODE_TYPE_LABEL[meta.node_type] || meta.node_type;
		let html = `<strong>${this.#escape(label)}</strong><br><span style="opacity:.7">${typeLabel}</span>`;

		if (meta.node_type === 'host' && meta.comm_methods && meta.comm_methods.length > 0) {
			const names = meta.comm_methods.map(m => CWidgetMonitoringMap.#COMM_METHOD_LABEL[m] || m).join(', ');
			html += `<br><span style="opacity:.7">通信方式: ${this.#escape(names)}</span>`;
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
