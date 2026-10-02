/**
 * Topological Sort Visualizer - Data Structures in C
 * visualization.js - Controller for Stepping, Animation, & Dynamic UI Panels
 */

class VisualizerController {
  constructor(graph) {
    this.graph = graph;
    this.steps = [];
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1000; // ms per step
    this.algorithm = 'kahns'; // 'kahns' or 'dfs'
    this.audioEnabled = true;
    this.audioCtx = null;

    this.initElements();
  }

  initElements() {
    this.btnPlay = document.getElementById('btnPlay');
    this.btnPause = document.getElementById('btnPause');
    this.btnStepNext = document.getElementById('btnStepNext');
    this.btnStepPrev = document.getElementById('btnStepPrev');
    this.btnReset = document.getElementById('btnReset');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedLabel = document.getElementById('speedLabel');
    this.algoSelect = document.getElementById('algoSelect');

    this.stepTitleEl = document.getElementById('stepTitle');
    this.stepDescEl = document.getElementById('stepDesc');
    this.stepBadgeEl = document.getElementById('stepBadge');

    this.indegreeTableBody = document.getElementById('indegreeTableBody');
    this.queueContainer = document.getElementById('queueContainer');
    this.resultContainer = document.getElementById('resultContainer');
    this.dsTitle = document.getElementById('dsTitle');

    // Report items
    this.reportVertices = document.getElementById('reportVertices');
    this.reportEdges = document.getElementById('reportEdges');
    this.reportAlgorithm = document.getElementById('reportAlgorithm');
    this.reportCycle = document.getElementById('reportCycle');
    this.reportProcessed = document.getElementById('reportProcessed');
    this.reportStatus = document.getElementById('reportStatus');
    this.reportOrder = document.getElementById('reportOrder');

    this.bindEvents();
  }

  bindEvents() {
    if (this.btnPlay) this.btnPlay.addEventListener('click', () => this.play());
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.pause());
    if (this.btnStepNext) this.btnStepNext.addEventListener('click', () => this.stepForward());
    if (this.btnStepPrev) this.btnStepPrev.addEventListener('click', () => this.stepBackward());
    if (this.btnReset) this.btnReset.addEventListener('click', () => this.reset());

    if (this.speedSlider) {
      this.speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.speed = 1500 / val;
        if (this.speedLabel) this.speedLabel.textContent = `${val}x`;
        if (this.isPlaying) {
          this.pause();
          this.play();
        }
      });
    }

    if (this.algoSelect) {
      this.algoSelect.addEventListener('change', (e) => {
        this.algorithm = e.target.value;
        if (this.dsTitle) {
          this.dsTitle.textContent = this.algorithm === 'kahns' ? 'Queue (FIFO) State' : 'Stack (LIFO) State';
        }
        this.prepare();
      });
    }
  }

  prepare() {
    this.pause();
    if (this.algorithm === 'kahns') {
      this.steps = TopologicalSortEngine.runKahnsAlgorithm(this.graph);
    } else {
      this.steps = TopologicalSortEngine.runDFSSort(this.graph);
    }
    this.currentStepIndex = 0;
    this.renderCurrentStep();
    this.updateControls();
  }

  play() {
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = 0;
    }
    this.isPlaying = true;
    this.updateControls();

    const loop = () => {
      if (!this.isPlaying) return;
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.renderCurrentStep();
        this.timer = setTimeout(loop, this.speed);
      } else {
        this.pause();
      }
    };
    this.timer = setTimeout(loop, this.speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateControls();
  }

  stepForward() {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
      this.playBeep(440, 0.05);
    }
    this.updateControls();
  }

  stepBackward() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
      this.playBeep(330, 0.05);
    }
    this.updateControls();
  }

  reset() {
    this.pause();
    this.prepare();
    this.playBeep(220, 0.08);
  }

  updateControls() {
    if (this.btnPlay) this.btnPlay.style.display = this.isPlaying ? 'none' : 'inline-flex';
    if (this.btnPause) this.btnPause.style.display = this.isPlaying ? 'inline-flex' : 'none';
    if (this.btnStepPrev) this.btnStepPrev.disabled = this.isPlaying || this.currentStepIndex === 0;
    if (this.btnStepNext) this.btnStepNext.disabled = this.isPlaying || this.currentStepIndex >= this.steps.length - 1;
  }

  renderCurrentStep() {
    if (!this.steps || this.steps.length === 0) return;
    const step = this.steps[this.currentStepIndex];

    // 1. Update Graph SVG
    this.graph.render(step.nodeStates, step.edgeStates);

    // 2. Step Title & Description
    if (this.stepBadgeEl) this.stepBadgeEl.textContent = `Step ${step.stepNumber} of ${this.steps.length}`;
    if (this.stepTitleEl) this.stepTitleEl.textContent = step.title;
    if (this.stepDescEl) this.stepDescEl.textContent = step.description;

    // 3. Update In-Degree Table
    this.renderIndegreeTable(step);

    // 4. Update Queue / Stack Container
    this.renderDataStructureView(step);

    // 5. Update Result Output Bar
    this.renderResultBar(step);

    // 6. Highlight active C code line
    this.highlightCCodeLine(step.cCodeLine);

    // 7. Update Correctness / Output Report
    this.renderReport(step);
  }

  renderIndegreeTable(step) {
    if (!this.indegreeTableBody) return;
    const initialIndegrees = this.graph.calculateIndegrees();
    let rows = '';

    this.graph.nodes.forEach(node => {
      const curIndeg = step.indegrees[node.id] !== undefined ? step.indegrees[node.id] : initialIndegrees[node.id];
      const state = step.nodeStates[node.id] || 'unvisited';
      let stateBadge = `<span class="badge" style="background: rgba(100,116,139,0.15); color: #94a3b8;">Unvisited</span>`;

      if (state === 'ready') {
        stateBadge = `<span class="badge badge-ready">In-degree 0</span>`;
      } else if (state === 'queue') {
        stateBadge = `<span class="badge badge-queue">In Queue</span>`;
      } else if (state === 'active') {
        stateBadge = `<span class="badge badge-active">Processing</span>`;
      } else if (state === 'done') {
        stateBadge = `<span class="badge badge-done">Sorted ✓</span>`;
      } else if (state === 'cycle') {
        stateBadge = `<span class="badge badge-cycle">Cycle Conflict ✗</span>`;
      }

      const isRowActive = state === 'active' || state === 'queue';
      rows += `
        <tr class="${isRowActive ? 'active-row' : ''}">
          <td style="font-weight: 700; color: var(--text-primary);">${node.label}</td>
          <td style="text-align: center;">${initialIndegrees[node.id] || 0}</td>
          <td style="text-align: center; font-weight: 700; color: ${curIndeg === 0 ? 'var(--color-done)' : 'var(--text-primary)'};">${curIndeg}</td>
          <td>${stateBadge}</td>
        </tr>
      `;
    });

    this.indegreeTableBody.innerHTML = rows;
  }

  renderDataStructureView(step) {
    if (!this.queueContainer) return;
    const items = this.algorithm === 'kahns' ? (step.queue || []) : (step.stack || []);

    if (items.length === 0) {
      this.queueContainer.innerHTML = `<span class="queue-empty-text">Empty (${this.algorithm === 'kahns' ? 'Queue' : 'Stack'})</span>`;
      return;
    }

    let html = '';
    items.forEach((id, idx) => {
      const node = this.graph.getNodeById(id);
      const isFront = this.algorithm === 'kahns' && idx === 0;
      const isRear = this.algorithm === 'kahns' && idx === items.length - 1;
      const isTop = this.algorithm === 'dfs' && idx === items.length - 1;

      let extraClass = '';
      if (isFront) extraClass += ' front-ptr';

      html += `
        <div class="queue-node ${extraClass}" title="${isTop ? 'Stack Top' : (isFront ? 'Front' : (isRear ? 'Rear' : ''))}">
          ${node ? node.label : id}
        </div>
      `;
    });

    this.queueContainer.innerHTML = html;
  }

  renderResultBar(step) {
    if (!this.resultContainer) return;
    const items = step.result || [];

    if (items.length === 0) {
      this.resultContainer.innerHTML = `<span class="queue-empty-text">No vertices ordered yet. Click "Play" or "Step Forward".</span>`;
      return;
    }

    let html = '';
    items.forEach((id, idx) => {
      const node = this.graph.getNodeById(id);
      const isLast = idx === items.length - 1;
      html += `
        <div class="result-item">
          <div class="result-badge">${node ? node.label : id}</div>
          ${!isLast ? '<span class="result-arrow">→</span>' : ''}
        </div>
      `;
    });

    this.resultContainer.innerHTML = html;
  }

  highlightCCodeLine(lineNum) {
    const codeLines = document.querySelectorAll('.code-line');
    codeLines.forEach(line => {
      const num = parseInt(line.getAttribute('data-line'), 10);
      if (num === lineNum) {
        line.classList.add('active-line');
        line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        line.classList.remove('active-line');
      }
    });
  }

  renderReport(step) {
    const n = this.graph.nodes.length;
    const e = this.graph.edges.length;
    const isEnd = this.currentStepIndex === this.steps.length - 1;

    if (this.reportVertices) this.reportVertices.textContent = n;
    if (this.reportEdges) this.reportEdges.textContent = e;
    if (this.reportAlgorithm) this.reportAlgorithm.textContent = this.algorithm === 'kahns' ? "Kahn's Algorithm" : "DFS Method";
    if (this.reportProcessed) this.reportProcessed.textContent = `${step.result ? step.result.length : 0} / ${n}`;

    if (this.reportCycle) {
      if (step.isCycle) {
        this.reportCycle.innerHTML = `<span style="color: var(--color-cycle); font-weight: bold;">Cycle Detected ⚠️</span>`;
      } else if (isEnd) {
        this.reportCycle.innerHTML = `<span style="color: var(--color-done); font-weight: bold;">Not Detected (DAG Validated)</span>`;
      } else {
        this.reportCycle.textContent = "Checking...";
      }
    }

    if (this.reportStatus) {
      if (step.isCycle) {
        this.reportStatus.innerHTML = `<span class="badge badge-cycle" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">✗ Topological Sorting Impossible (Graph is Cyclic)</span>`;
      } else if (isEnd && step.stats.isSuccess) {
        this.reportStatus.innerHTML = `<span class="badge badge-done" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">✓ Topological Sort Successful</span>`;
      } else {
        this.reportStatus.innerHTML = `<span class="badge badge-active" style="font-size: 0.9rem; padding: 0.4rem 0.85rem;">In Progress (Step ${step.stepNumber}/${this.steps.length})</span>`;
      }
    }

    if (this.reportOrder) {
      if (step.result && step.result.length > 0) {
        this.reportOrder.textContent = step.result.map(id => {
          const node = this.graph.getNodeById(id);
          return node ? node.label : id;
        }).join(' → ');
      } else {
        this.reportOrder.textContent = 'None';
      }
    }
  }

  playBeep(freq = 440, duration = 0.05) {
    if (!this.audioEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not supported or blocked
    }
  }
}

window.VisualizerController = VisualizerController;
