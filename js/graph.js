/**
 * Topological Sort Visualizer - Data Structures in C
 * graph.js - Graph Data Structure & Interactive SVG Canvas
 */

class DirectedGraph {
  constructor() {
    this.nodes = []; // Array of { id, label, x, y }
    this.edges = []; // Array of { from, to } (node ids)
    this.svg = null;
    this.selectedNode = null;
    this.draggingNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.mode = 'select'; // 'select', 'addNode', 'addEdge', 'delete'
    this.edgeStartNode = null;
    this.nodeRadius = 24;
    this.onGraphChange = null;
  }

  initSvg(svgElementId) {
    this.svg = document.getElementById(svgElementId);
    if (!this.svg) return;

    // Canvas click & mouse events
    this.svg.addEventListener('click', (e) => this.handleCanvasClick(e));
    this.svg.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.svg.addEventListener('mouseup', () => this.handleCanvasMouseUp());
    this.svg.addEventListener('mouseleave', () => this.handleCanvasMouseUp());

    this.render();
  }

  // Add Vertex
  addNode(label, x = null, y = null) {
    const id = this.generateId();
    if (!label) {
      label = this.getNextDefaultLabel();
    }

    // Default position if not provided
    if (x === null || y === null) {
      const rect = this.svg ? this.svg.getBoundingClientRect() : { width: 600, height: 400 };
      const padding = 60;
      x = padding + Math.random() * (rect.width - 2 * padding);
      y = padding + Math.random() * (rect.height - 2 * padding);
    }

    const node = { id, label, x, y };
    this.nodes.push(node);
    this.render();
    if (this.onGraphChange) this.onGraphChange();
    return node;
  }

  // Remove Vertex
  removeNode(id) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    if (this.selectedNode === id) this.selectedNode = null;
    if (this.edgeStartNode === id) this.edgeStartNode = null;
    this.render();
    if (this.onGraphChange) this.onGraphChange();
  }

  // Add Directed Edge (from -> to)
  addEdge(fromId, toId) {
    if (fromId === toId) {
      return { success: false, message: "Self-loops are not allowed in a DAG." };
    }

    // Prevent duplicate edges
    const exists = this.edges.some(e => e.from === fromId && e.to === toId);
    if (exists) {
      return { success: false, message: "This directed edge already exists." };
    }

    this.edges.push({ from: fromId, to: toId });
    this.render();
    if (this.onGraphChange) this.onGraphChange();
    return { success: true };
  }

  // Remove Directed Edge
  removeEdge(fromId, toId) {
    this.edges = this.edges.filter(e => !(e.from === fromId && e.to === toId));
    this.render();
    if (this.onGraphChange) this.onGraphChange();
  }

  // Clear Graph
  clear() {
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.edgeStartNode = null;
    this.render();
    if (this.onGraphChange) this.onGraphChange();
  }

  // Helper: Generate next A, B, C, ... label
  getNextDefaultLabel() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const existingLabels = new Set(this.nodes.map(n => n.label));
    for (let i = 0; i < alphabet.length; i++) {
      if (!existingLabels.has(alphabet[i])) {
        return alphabet[i];
      }
    }
    return `V${this.nodes.length + 1}`;
  }

  generateId() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id);
  }

  getNodeByLabel(label) {
    return this.nodes.find(n => n.label.toUpperCase() === label.trim().toUpperCase());
  }

  // Calculate in-degree for all vertices
  calculateIndegrees() {
    const indegreeMap = {};
    this.nodes.forEach(n => {
      indegreeMap[n.id] = 0;
    });
    this.edges.forEach(e => {
      if (indegreeMap[e.to] !== undefined) {
        indegreeMap[e.to]++;
      }
    });
    return indegreeMap;
  }

  // Calculate out-degrees
  calculateOutdegrees() {
    const outdegreeMap = {};
    this.nodes.forEach(n => {
      outdegreeMap[n.id] = 0;
    });
    this.edges.forEach(e => {
      if (outdegreeMap[e.from] !== undefined) {
        outdegreeMap[e.from]++;
      }
    });
    return outdegreeMap;
  }

  // Get C-Style Adjacency Matrix representation
  getAdjacencyMatrix() {
    const n = this.nodes.length;
    const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
    const nodeIndexMap = {};
    this.nodes.forEach((node, idx) => {
      nodeIndexMap[node.id] = idx;
    });

    this.edges.forEach(e => {
      const u = nodeIndexMap[e.from];
      const v = nodeIndexMap[e.to];
      if (u !== undefined && v !== undefined) {
        matrix[u][v] = 1;
      }
    });

    return { matrix, nodeIndexMap, labels: this.nodes.map(n => n.label) };
  }

  // Get Adjacency List representation
  getAdjacencyList() {
    const adj = {};
    this.nodes.forEach(n => {
      adj[n.id] = [];
    });
    this.edges.forEach(e => {
      if (adj[e.from]) {
        adj[e.from].push(e.to);
      }
    });
    return adj;
  }

  // ==========================================
  // SVG Canvas Interaction & Rendering
  // ==========================================

  getSVGCoordinates(event) {
    if (!this.svg) return { x: 0, y: 0 };
    const rect = this.svg.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  handleCanvasClick(e) {
    const coords = this.getSVGCoordinates(e);

    // If in Add Node mode and didn't click existing node
    if (this.mode === 'addNode' && !e.target.closest('.svg-node-group')) {
      this.addNode(null, coords.x, coords.y);
    }
  }

  handleNodeClick(nodeId, e) {
    e.stopPropagation();

    if (this.mode === 'delete') {
      this.removeNode(nodeId);
      return;
    }

    if (this.mode === 'addEdge') {
      if (!this.edgeStartNode) {
        this.edgeStartNode = nodeId;
        this.render();
      } else {
        if (this.edgeStartNode !== nodeId) {
          this.addEdge(this.edgeStartNode, nodeId);
        }
        this.edgeStartNode = null;
        this.render();
      }
      return;
    }

    // Select mode
    this.selectedNode = (this.selectedNode === nodeId) ? null : nodeId;
    this.render();
  }

  handleNodeMouseDown(nodeId, e) {
    e.stopPropagation();
    if (this.mode === 'delete' || this.mode === 'addEdge') return;

    this.draggingNode = nodeId;
    const node = this.getNodeById(nodeId);
    const coords = this.getSVGCoordinates(e);
    this.dragOffset = {
      x: coords.x - node.x,
      y: coords.y - node.y
    };
  }

  handleCanvasMouseMove(e) {
    if (!this.draggingNode) return;
    const coords = this.getSVGCoordinates(e);
    const node = this.getNodeById(this.draggingNode);
    if (node && this.svg) {
      const rect = this.svg.getBoundingClientRect();
      const padding = this.nodeRadius + 10;
      node.x = Math.max(padding, Math.min(rect.width - padding, coords.x - this.dragOffset.x));
      node.y = Math.max(padding, Math.min(rect.height - padding, coords.y - this.dragOffset.y));
      this.render();
    }
  }

  handleCanvasMouseUp() {
    this.draggingNode = null;
  }

  // Render SVG Elements
  render(nodeStates = {}, edgeStates = {}) {
    if (!this.svg) return;

    const indegrees = this.calculateIndegrees();
    let html = `
      <defs>
        <!-- Arrowhead Marker (Default) -->
        <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--border-color)" />
        </marker>
        <!-- Arrowhead Marker (Highlighted) -->
        <marker id="arrow-highlight" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--primary)" />
        </marker>
        <!-- Arrowhead Marker (Active) -->
        <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--color-active)" />
        </marker>
        <!-- Arrowhead Marker (Done) -->
        <marker id="arrow-done" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--color-done)" />
        </marker>
        <!-- Arrowhead Marker (Cycle) -->
        <marker id="arrow-cycle" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--color-cycle)" />
        </marker>
      </defs>
    `;

    // Render Edges
    this.edges.forEach(edge => {
      const u = this.getNodeById(edge.from);
      const v = this.getNodeById(edge.to);
      if (!u || !v) return;

      const edgeKey = `${edge.from}->${edge.to}`;
      const state = edgeStates[edgeKey] || 'default';
      let markerId = 'arrow';
      let edgeClass = 'svg-edge';

      if (state === 'highlighted') {
        markerId = 'arrow-highlight';
        edgeClass += ' highlighted';
      } else if (state === 'active') {
        markerId = 'arrow-active';
        edgeClass += ' active';
      } else if (state === 'done') {
        markerId = 'arrow-done';
        edgeClass += ' done';
      } else if (state === 'cycle') {
        markerId = 'arrow-cycle';
        edgeClass += ' cycle';
      }

      // Check if reciprocal edge exists for subtle curve
      const reciprocal = this.edges.some(e => e.from === edge.to && e.to === edge.from);
      let pathD = '';

      if (reciprocal) {
        // Curved edge to avoid overlapping
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const cx = (u.x + v.x) / 2 - dy * 0.2;
        const cy = (u.y + v.y) / 2 + dx * 0.2;
        pathD = `M ${u.x} ${u.y} Q ${cx} ${cy} ${v.x} ${v.y}`;
      } else {
        pathD = `M ${u.x} ${u.y} L ${v.x} ${v.y}`;
      }

      html += `
        <path d="${pathD}" class="${edgeClass}" marker-end="url(#${markerId})" data-from="${edge.from}" data-to="${edge.to}" onclick="window.currentGraph.handleEdgeClick('${edge.from}', '${edge.to}', event)"/>
      `;
    });

    // Render Nodes
    this.nodes.forEach(node => {
      const isSelected = this.selectedNode === node.id;
      const isEdgeStart = this.edgeStartNode === node.id;
      const state = nodeStates[node.id] || 'default';
      const indeg = indegrees[node.id] || 0;

      let groupClass = 'svg-node-group';
      if (isSelected) groupClass += ' selected';
      if (isEdgeStart) groupClass += ' edge-start state-ready';
      if (state !== 'default') groupClass += ` state-${state}`;

      html += `
        <g class="${groupClass}" transform="translate(${node.x}, ${node.y})"
           onmousedown="window.currentGraph.handleNodeMouseDown('${node.id}', event)"
           onclick="window.currentGraph.handleNodeClick('${node.id}', event)">
          
          <!-- Outer Glow / Selection Ring -->
          ${isEdgeStart || isSelected ? `<circle r="${this.nodeRadius + 6}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-dasharray="4"/>` : ''}
          
          <!-- Main Node Circle -->
          <circle class="svg-node-circle" r="${this.nodeRadius}" />
          
          <!-- Node Label -->
          <text class="svg-node-label">${node.label}</text>
          
          <!-- In-degree Badge (Top-right pill) -->
          <g transform="translate(${this.nodeRadius - 4}, -${this.nodeRadius - 4})">
            <circle class="svg-indegree-badge" r="10" />
            <text class="svg-indegree-text">${indeg}</text>
          </g>
        </g>
      `;
    });

    this.svg.innerHTML = html;
  }

  handleEdgeClick(fromId, toId, e) {
    e.stopPropagation();
    if (this.mode === 'delete') {
      this.removeEdge(fromId, toId);
    }
  }

  // ==========================================
  // Presets & Templates
  // ==========================================

  loadPreset(presetName) {
    this.clear();
    const width = this.svg ? this.svg.clientWidth || 700 : 700;
    const height = this.svg ? this.svg.clientHeight || 450 : 450;

    if (presetName === 'classic') {
      // 6-node DAG: A->B, A->C, B->D, C->D, D->E, E->F
      const a = this.addNode('A', width * 0.15, height * 0.5);
      const b = this.addNode('B', width * 0.35, height * 0.25);
      const c = this.addNode('C', width * 0.35, height * 0.75);
      const d = this.addNode('D', width * 0.55, height * 0.5);
      const e = this.addNode('E', width * 0.75, height * 0.5);
      const f = this.addNode('F', width * 0.90, height * 0.5);

      this.addEdge(a.id, b.id);
      this.addEdge(a.id, c.id);
      this.addEdge(b.id, d.id);
      this.addEdge(c.id, d.id);
      this.addEdge(d.id, e.id);
      this.addEdge(e.id, f.id);
    } else if (presetName === 'courses') {
      // Course Prerequisite graph (7 vertices)
      const math1 = this.addNode('Math1', width * 0.15, height * 0.25);
      const cs1 = this.addNode('CS1', width * 0.15, height * 0.75);
      const dsa = this.addNode('DSA', width * 0.40, height * 0.5);
      const algo = this.addNode('Algo', width * 0.65, height * 0.3);
      const os = this.addNode('OS', width * 0.65, height * 0.7);
      const ai = this.addNode('AI', width * 0.88, height * 0.5);

      this.addEdge(math1.id, dsa.id);
      this.addEdge(cs1.id, dsa.id);
      this.addEdge(dsa.id, algo.id);
      this.addEdge(dsa.id, os.id);
      this.addEdge(algo.id, ai.id);
      this.addEdge(os.id, ai.id);
    } else if (presetName === 'cycle') {
      // Cyclic Graph (Cycle between A, B, C)
      const a = this.addNode('A', width * 0.3, height * 0.3);
      const b = this.addNode('B', width * 0.6, height * 0.3);
      const c = this.addNode('C', width * 0.45, height * 0.7);
      const d = this.addNode('D', width * 0.75, height * 0.7);

      this.addEdge(a.id, b.id);
      this.addEdge(b.id, c.id);
      this.addEdge(c.id, a.id); // Cycle!
      this.addEdge(b.id, d.id);
    } else if (presetName === 'diamond') {
      // Diamond Graph (Multiple Valid Orderings)
      const a = this.addNode('A', width * 0.2, height * 0.5);
      const b = this.addNode('B', width * 0.5, height * 0.25);
      const c = this.addNode('C', width * 0.5, height * 0.75);
      const d = this.addNode('D', width * 0.8, height * 0.5);

      this.addEdge(a.id, b.id);
      this.addEdge(a.id, c.id);
      this.addEdge(b.id, d.id);
      this.addEdge(c.id, d.id);
    } else if (presetName === 'chain') {
      // Linear Chain
      const a = this.addNode('A', width * 0.15, height * 0.5);
      const b = this.addNode('B', width * 0.35, height * 0.5);
      const c = this.addNode('C', width * 0.55, height * 0.5);
      const d = this.addNode('D', width * 0.75, height * 0.5);
      const e = this.addNode('E', width * 0.90, height * 0.5);

      this.addEdge(a.id, b.id);
      this.addEdge(b.id, c.id);
      this.addEdge(c.id, d.id);
      this.addEdge(d.id, e.id);
    }

    this.render();
  }

  // ==========================================
  // Text Input / Export Parsing
  // ==========================================

  importFromText(text) {
    try {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let vertices = [];
      let edges = [];
      let readingEdges = false;

      for (let line of lines) {
        if (line.toLowerCase().startsWith('vertices:') || line.toLowerCase().startsWith('nodes:')) {
          const parts = line.split(':')[1].trim().split(/[\s,]+/);
          vertices = parts.filter(p => p.length > 0);
        } else if (line.toLowerCase().startsWith('edges:')) {
          readingEdges = true;
        } else if (readingEdges || line.includes('->') || line.includes(' ')) {
          let cleanLine = line.replace('->', ' ').replace(',', ' ');
          let parts = cleanLine.trim().split(/\s+/);
          if (parts.length >= 2) {
            edges.push({ from: parts[0], to: parts[1] });
          }
        }
      }

      if (vertices.length === 0 && edges.length > 0) {
        const vSet = new Set();
        edges.forEach(e => { vSet.add(e.from); vSet.add(e.to); });
        vertices = Array.from(vSet);
      }

      if (vertices.length === 0) {
        return { success: false, message: "No vertices found in text format." };
      }

      this.clear();
      const width = this.svg ? this.svg.clientWidth || 700 : 700;
      const height = this.svg ? this.svg.clientHeight || 450 : 450;
      const nodeObjMap = {};

      // Place vertices in a clean circle or grid
      const count = vertices.length;
      const radius = Math.min(width, height) * 0.35;
      const centerX = width / 2;
      const centerY = height / 2;

      vertices.forEach((label, idx) => {
        const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const node = this.addNode(label, x, y);
        nodeObjMap[label.toUpperCase()] = node.id;
      });

      edges.forEach(e => {
        const fromId = nodeObjMap[e.from.toUpperCase()];
        const toId = nodeObjMap[e.to.toUpperCase()];
        if (fromId && toId) {
          this.addEdge(fromId, toId);
        }
      });

      this.render();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  exportToText() {
    let out = `Number of vertices: ${this.nodes.length}\n\n`;
    out += `Vertices:\n${this.nodes.map(n => n.label).join(' ')}\n\n`;
    out += `Edges:\n`;
    this.edges.forEach(e => {
      const u = this.getNodeById(e.from);
      const v = this.getNodeById(e.to);
      if (u && v) {
        out += `${u.label} ${v.label}\n`;
      }
    });
    return out;
  }
}

// Global reference
window.DirectedGraph = DirectedGraph;
