/**
 * Topological Sort Visualizer - Data Structures in C
 * main.js - Global App Initialization, Theme Management, Quiz, & C Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initActiveNavLink();

  // Initialize Visualizer if on visualizer.html
  if (document.getElementById('graphSvg')) {
    initVisualizerPage();
  }

  // Initialize C Program page if on c-program.html
  if (document.getElementById('cCodeViewer') || document.getElementById('runTerminalBtn')) {
    initCProgramPage();
  }

  // Initialize Practice / Quiz page if on practice.html
  if (document.getElementById('quizContainer') || document.getElementById('challengeContainer') || document.querySelector('.accordion-header')) {
    initPracticePage();
  }
});

/* ==========================================================================
   Theme & Mobile Navigation
   ========================================================================== */

function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('agy_ts_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('agy_ts_theme', next);
      updateThemeIcon(next);
      if (window.currentGraph) {
        window.currentGraph.render();
      }
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }
}

function initActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   Visualizer Workspace Initialization
   ========================================================================== */

function initVisualizerPage() {
  const graph = new DirectedGraph();
  window.currentGraph = graph;
  graph.initSvg('graphSvg');

  // Load Classic preset by default
  graph.loadPreset('classic');

  const controller = new VisualizerController(graph);
  window.currentController = controller;
  controller.prepare();

  // On graph modification, reset controller
  graph.onGraphChange = () => {
    controller.prepare();
  };

  // Tool buttons
  const modeButtons = {
    'btnModeSelect': 'select',
    'btnModeAddNode': 'addNode',
    'btnModeAddEdge': 'addEdge',
    'btnModeDelete': 'delete'
  };

  Object.entries(modeButtons).forEach(([btnId, mode]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        Object.keys(modeButtons).forEach(id => {
          const b = document.getElementById(id);
          if (b) b.classList.remove('btn-primary');
          if (b) b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        graph.mode = mode;
        graph.edgeStartNode = null;
        graph.render();
      });
    }
  });

  // Action buttons
  const btnClearGraph = document.getElementById('btnClearGraph');
  if (btnClearGraph) {
    btnClearGraph.addEventListener('click', () => {
      if (confirm('Clear the entire graph?')) {
        graph.clear();
      }
    });
  }

  const btnAddNodeDirect = document.getElementById('btnAddNodeDirect');
  if (btnAddNodeDirect) {
    btnAddNodeDirect.addEventListener('click', () => {
      const label = prompt('Enter vertex name (e.g. A, B, C):', graph.getNextDefaultLabel());
      if (label && label.trim().length > 0) {
        graph.addNode(label.trim());
      }
    });
  }

  const btnAddEdgeDirect = document.getElementById('btnAddEdgeDirect');
  if (btnAddEdgeDirect) {
    btnAddEdgeDirect.addEventListener('click', () => {
      const uLabel = prompt('Enter source vertex (From):');
      if (!uLabel) return;
      const vLabel = prompt('Enter target vertex (To):');
      if (!vLabel) return;

      const uNode = graph.getNodeByLabel(uLabel);
      const vNode = graph.getNodeByLabel(vLabel);

      if (!uNode) { alert(`Vertex "${uLabel}" not found.`); return; }
      if (!vNode) { alert(`Vertex "${vLabel}" not found.`); return; }

      const res = graph.addEdge(uNode.id, vNode.id);
      if (!res.success) {
        alert(res.message);
      }
    });
  }

  // Presets selector
  const presetSelect = document.getElementById('presetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        graph.loadPreset(e.target.value);
      }
    });
  }

  // Text Import / Export
  const btnImportText = document.getElementById('btnImportText');
  const btnExportText = document.getElementById('btnExportText');
  const graphTextInput = document.getElementById('graphTextInput');

  if (btnImportText && graphTextInput) {
    btnImportText.addEventListener('click', () => {
      const res = graph.importFromText(graphTextInput.value);
      if (!res.success) {
        alert("Error importing text: " + res.message);
      }
    });
  }

  if (btnExportText && graphTextInput) {
    btnExportText.addEventListener('click', () => {
      graphTextInput.value = graph.exportToText();
    });
  }

  // Handle manual "Run Topological Sort" CTA button
  const btnRunSort = document.getElementById('btnRunSort');
  if (btnRunSort) {
    btnRunSort.addEventListener('click', () => {
      controller.prepare();
      controller.play();
    });
  }
}

/* ==========================================================================
   C Program Page & Terminal Simulator
   ========================================================================== */

function initCProgramPage() {
  // Tab switcher
  const tabBtns = document.querySelectorAll('.code-tab-btn');
  const codePanels = document.querySelectorAll('.code-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      codePanels.forEach(panel => {
        if (panel.id === targetTab) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });

  // Copy Code Button
  const btnCopyCode = document.getElementById('btnCopyCode');
  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      const activePanel = document.querySelector('.code-tab-panel:not([style*="display: none"])');
      if (activePanel) {
        const text = activePanel.innerText;
        navigator.clipboard.writeText(text).then(() => {
          btnCopyCode.textContent = '✓ Copied!';
          setTimeout(() => { btnCopyCode.textContent = '📋 Copy Code'; }, 2000);
        });
      }
    });
  }

  // Interactive C Simulator Runner
  const runTerminalBtn = document.getElementById('runTerminalBtn');
  const simVertices = document.getElementById('simVertices');
  const simEdgesCount = document.getElementById('simEdgesCount');
  const simEdgesData = document.getElementById('simEdgesData');
  const terminalOutput = document.getElementById('terminalOutput');

  if (runTerminalBtn && terminalOutput) {
    runTerminalBtn.addEventListener('click', () => {
      const n = parseInt(simVertices.value, 10);
      const e = parseInt(simEdgesCount.value, 10);
      const edgesRaw = simEdgesData.value.trim().split('\n');

      let stdout = `$ gcc topological_sort_kahn.c -o topo_sort\n$ ./topo_sort\n\n`;
      stdout += `Enter number of vertices: ${n}\n`;
      stdout += `Enter number of edges: ${e}\n`;
      stdout += `Enter edges (u v):\n`;

      const graph = Array(n).fill(0).map(() => Array(n).fill(0));
      const indegree = Array(n).fill(0);
      const queue = [];
      let front = 0, rear = 0;
      const result = [];
      let count = 0;

      for (let i = 0; i < e; i++) {
        if (i < edgesRaw.length) {
          const parts = edgesRaw[i].trim().split(/\s+/);
          if (parts.length >= 2) {
            const u = parseInt(parts[0], 10);
            const v = parseInt(parts[1], 10);
            if (u >= 0 && u < n && v >= 0 && v < n) {
              stdout += `${u} ${v}\n`;
              graph[u][v] = 1;
              indegree[v]++;
            }
          }
        }
      }

      stdout += `\n[Computing In-degrees...]\n`;
      for (let i = 0; i < n; i++) {
        stdout += `Vertex ${i}: Indegree = ${indegree[i]}\n`;
        if (indegree[i] === 0) {
          queue[rear++] = i;
        }
      }

      stdout += `\n[Initial In-degree 0 Queue: [ `;
      for (let i = 0; i < rear; i++) stdout += `${queue[i]} `;
      stdout += `]]\n\n[Processing Queue...]\n`;

      while (front < rear) {
        const u = queue[front++];
        result[count++] = u;
        stdout += `-> Dequeued ${u}, Added to Topological Order.\n`;

        for (let v = 0; v < n; v++) {
          if (graph[u][v] === 1) {
            indegree[v]--;
            stdout += `   Edge ${u}->${v}: Decremented indegree of ${v} to ${indegree[v]}`;
            if (indegree[v] === 0) {
              queue[rear++] = v;
              stdout += ` (Indegree 0 -> Enqueued ${v})`;
            }
            stdout += `\n`;
          }
        }
      }

      stdout += `\n--------------------------------------------\n`;
      if (count !== n) {
        stdout += `[OUTPUT]: Cycle detected! Topological sorting is not possible.\n`;
        stdout += `Processed vertices: ${count}/${n}\n`;
      } else {
        stdout += `[OUTPUT]: Topological Order: `;
        for (let i = 0; i < count; i++) {
          stdout += `${result[i]} `;
        }
        stdout += `\n[STATUS]: Execution completed with return code 0.\n`;
      }

      terminalOutput.textContent = '';
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        if (charIdx < stdout.length) {
          terminalOutput.textContent += stdout[charIdx++];
          terminalOutput.scrollTop = terminalOutput.scrollHeight;
        } else {
          clearInterval(typeInterval);
        }
      }, 8);
    });
  }
}

/* ==========================================================================
   Practice & Quiz Logic
   ========================================================================== */

function initPracticePage() {
  // 1. Accordion for Theory Questions
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(hdr => {
    hdr.addEventListener('click', () => {
      const content = hdr.nextElementSibling;
      const arrow = hdr.querySelector('span:last-child');
      const isExpanded = content.classList.contains('show');
      
      // Close all other accordions
      document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('show'));
      document.querySelectorAll('.accordion-header span:last-child').forEach(a => a.textContent = '▼');

      if (!isExpanded) {
        content.classList.add('show');
        if (arrow) arrow.textContent = '▲';
      }
    });
  });

  // 2. Interactive Multiple Choice Quiz
  const quizQuestions = [
    {
      q: "1. What is the fundamental condition for a graph to possess a Topological Sort?",
      options: [
        "It must be an Undirected Graph",
        "It must be a Directed Acyclic Graph (DAG)",
        "It must contain at least one directed cycle",
        "It must be a Complete Graph"
      ],
      correct: 1,
      explanation: "Topological sorting is strictly defined for Directed Acyclic Graphs (DAGs). A cycle introduces a circular dependency (e.g. A depends on B and B depends on A), making linear ordering impossible."
    },
    {
      q: "2. What is the 'in-degree' of a vertex in a directed graph?",
      options: [
        "The number of outgoing edges from that vertex",
        "The total number of vertices reachable from that vertex",
        "The number of directed edges coming INTO that vertex",
        "The weight of the vertex"
      ],
      correct: 2,
      explanation: "In-degree is the number of incoming directed edges arriving at a vertex, representing how many prerequisite dependencies must be satisfied before processing that vertex."
    },
    {
      q: "3. In Kahn's Algorithm, which vertices are initially inserted into the queue?",
      options: [
        "Vertices with the highest out-degree",
        "Vertices with in-degree equal to 0",
        "Vertices with in-degree equal to 1",
        "Any randomly chosen vertex"
      ],
      correct: 1,
      explanation: "Vertices with an in-degree of 0 have no incoming prerequisite dependencies, meaning they can be executed/processed immediately."
    },
    {
      q: "4. What is the Time Complexity of Topological Sort using Kahn's Algorithm with an Adjacency List?",
      options: [
        "O(V²)",
        "O(V + E)",
        "O(V log V)",
        "O(E²)"
      ],
      correct: 1,
      explanation: "Every vertex is enqueued and dequeued once (O(V)), and every directed edge is examined and decremented once (O(E)), giving an optimal linear time complexity of O(V + E)."
    },
    {
      q: "5. How does Kahn's Algorithm detect the presence of a cycle in the graph?",
      options: [
        "If the queue overflows",
        "If the count of processed vertices in the topological order is less than V",
        "If all vertices have in-degree > 2",
        "If the algorithm runs indefinitely"
      ],
      correct: 1,
      explanation: "Vertices participating in a directed cycle never reach an in-degree of 0. Thus, the queue empties prematurely before all V vertices are processed (count < V)."
    },
    {
      q: "6. Can a Directed Acyclic Graph (DAG) have more than one valid Topological Order?",
      options: [
        "No, topological sort is always unique for any DAG",
        "Yes, whenever multiple vertices have in-degree 0 simultaneously, multiple valid orderings exist",
        "Only if the graph is disconnected",
        "Only if all edge weights are equal"
      ],
      correct: 1,
      explanation: "Whenever multiple independent vertices have in-degree 0 at the same time, choosing any of them first produces a distinct yet valid topological ordering."
    },
    {
      q: "7. Which of the following is a real-world application of Topological Sorting?",
      options: [
        "Finding the shortest path in GPS navigation",
        "Compiling source files with dependencies in build systems (Make/CMake)",
        "Balancing an AVL tree",
        "Compressing image files with Huffman coding"
      ],
      correct: 1,
      explanation: "Build systems like Make, npm, and compiler linkers use topological sort to determine the correct build order of files based on their prerequisite dependencies."
    }
  ];

  const quizContainer = document.getElementById('quizContainer');
  const btnSubmitQuiz = document.getElementById('btnSubmitQuiz');
  const quizScoreCard = document.getElementById('quizScoreCard');

  if (quizContainer) {
    let quizHtml = '';
    quizQuestions.forEach((item, qIdx) => {
      quizHtml += `
        <div class="quiz-card" data-qindex="${qIdx}">
          <div class="question-text">${item.q}</div>
          <div class="options-grid">
            ${item.options.map((opt, optIdx) => `
              <label class="option-label" data-opt="${optIdx}">
                <input type="radio" name="question_${qIdx}" value="${optIdx}">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
          <div class="explanation-box" id="explanation_${qIdx}"></div>
        </div>
      `;
    });
    quizContainer.innerHTML = quizHtml;

    if (btnSubmitQuiz) {
      btnSubmitQuiz.addEventListener('click', () => {
        let score = 0;
        quizQuestions.forEach((item, qIdx) => {
          const selected = document.querySelector(`input[name="question_${qIdx}"]:checked`);
          const explEl = document.getElementById(`explanation_${qIdx}`);
          const card = document.querySelector(`.quiz-card[data-qindex="${qIdx}"]`);
          const labels = card.querySelectorAll('.option-label');

          labels.forEach(l => {
            l.classList.remove('correct', 'incorrect');
          });

          if (selected) {
            const userVal = parseInt(selected.value, 10);
            if (userVal === item.correct) {
              score++;
              labels[userVal].classList.add('correct');
              explEl.innerHTML = `<strong style="color: var(--color-done);">✓ Correct!</strong> ${item.explanation}`;
              explEl.style.background = 'rgba(16, 185, 129, 0.1)';
              explEl.style.border = '1px solid var(--color-done)';
            } else {
              labels[userVal].classList.add('incorrect');
              labels[item.correct].classList.add('correct');
              explEl.innerHTML = `<strong style="color: var(--color-cycle);">✗ Incorrect.</strong> ${item.explanation}`;
              explEl.style.background = 'rgba(239, 68, 68, 0.1)';
              explEl.style.border = '1px solid var(--color-cycle)';
            }
          } else {
            labels[item.correct].classList.add('correct');
            explEl.innerHTML = `<strong style="color: var(--color-queue);">⚠️ Not Answered.</strong> ${item.explanation}`;
            explEl.style.background = 'rgba(251, 191, 36, 0.1)';
            explEl.style.border = '1px solid var(--color-queue)';
          }
          explEl.classList.add('show');
        });

        if (quizScoreCard) {
          quizScoreCard.style.display = 'block';
          quizScoreCard.innerHTML = `
            <div style="text-align: center;">
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Quiz Completed!</h3>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">Your Score: ${score} / ${quizQuestions.length} (${Math.round((score/quizQuestions.length)*100)}%)</p>
              <p style="color: var(--text-secondary); margin-top: 0.5rem;">${score === quizQuestions.length ? '🌟 Outstanding! You have mastered Topological Sort concepts!' : 'Review the explanations above to strengthen your Data Structures fundamentals.'}</p>
            </div>
          `;
          quizScoreCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // 3. Interactive Topological Sort Ordering Game
  initSortMiniGame();
}

function initSortMiniGame() {
  const challengeContainer = document.getElementById('challengeContainer');
  if (!challengeContainer) return;

  // Challenge DAG: 4 nodes: A -> B, A -> C, B -> D, C -> D
  // Valid orders: A B C D or A C B D
  const availableNodes = ['A', 'B', 'C', 'D'];
  const dependencies = {
    'B': ['A'],
    'C': ['A'],
    'D': ['B', 'C']
  };

  let userSelection = [];

  function renderGame() {
    challengeContainer.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem;">
        <h4 style="margin-bottom: 0.75rem;">Interactive Challenge: Order the DAG Vertices!</h4>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">
          Directed Edges: <strong>A → B</strong>, <strong>A → C</strong>, <strong>B → D</strong>, <strong>C → D</strong>.<br>
          Click the vertices below one by one to construct a valid topological order.
        </p>
        
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem;">
          ${availableNodes.map(node => `
            <button class="btn ${userSelection.includes(node) ? 'btn-secondary' : 'btn-primary'} game-node-btn" 
                    data-node="${node}" 
                    ${userSelection.includes(node) ? 'disabled' : ''}>
              ${node}
            </button>
          `).join('')}
          <button class="btn btn-outline" id="btnResetGame">🔄 Reset Order</button>
        </div>

        <div style="background: var(--bg-canvas); padding: 1rem; border-radius: var(--radius-md); border: 1px dashed var(--border-color); min-height: 54px; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 600; color: var(--text-muted); margin-right: 0.5rem;">Your Ordering:</span>
          ${userSelection.length === 0 ? '<span style="color: var(--text-muted); font-style: italic;">None selected yet</span>' : ''}
          ${userSelection.map((node, i) => `
            <span class="badge badge-ready" style="font-size: 1rem; padding: 0.4rem 0.8rem;">${node}</span>
            ${i < userSelection.length - 1 ? '<span style="color: var(--primary);">→</span>' : ''}
          `).join('')}
        </div>

        <div id="gameFeedback" style="margin-top: 1rem;"></div>
      </div>
    `;

    document.querySelectorAll('.game-node-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const node = btn.getAttribute('data-node');
        handleGameNodeClick(node);
      });
    });

    const resetBtn = document.getElementById('btnResetGame');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        userSelection = [];
        renderGame();
      });
    }
  }

  function handleGameNodeClick(node) {
    // Check if dependencies are satisfied
    const reqs = dependencies[node] || [];
    const missing = reqs.filter(r => !userSelection.includes(r));
    const feedback = document.getElementById('gameFeedback');

    if (missing.length > 0) {
      if (feedback) {
        feedback.innerHTML = `
          <div style="color: var(--color-cycle); padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: var(--radius-sm); border: 1px solid var(--color-cycle);">
            <strong>Invalid Move!</strong> You cannot choose <strong>${node}</strong> before its prerequisite vertex <strong>${missing.join(', ')}</strong> is ordered.
          </div>
        `;
      }
      return;
    }

    userSelection.push(node);
    renderGame();

    const newFeedback = document.getElementById('gameFeedback');
    if (userSelection.length === availableNodes.length) {
      if (newFeedback) {
        newFeedback.innerHTML = `
          <div style="color: var(--color-done); padding: 0.75rem; background: rgba(16,185,129,0.1); border-radius: var(--radius-sm); border: 1px solid var(--color-done);">
            <strong>🎉 Correct!</strong> <code>${userSelection.join(' → ')}</code> is a completely valid topological ordering!
          </div>
        `;
      }
    }
  }

  renderGame();
}
