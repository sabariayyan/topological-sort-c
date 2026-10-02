/**
 * Topological Sort Visualizer - Data Structures in C
 * topological-sort.js - Step Generator Engine for Kahn's & DFS Algorithms
 */

class TopologicalSortEngine {
  /**
   * Generates step-by-step frames for Kahn's Algorithm (BFS Queue)
   * Synced with C program line numbers
   * 
   * C Program Line Mapping for Kahn's:
   * Line 1-20: Variable Declarations & Input (Graph & Indegree setup)
   * Line 22-27: Calculate/Find vertices with indegree == 0 and insert into queue
   * Line 29: while (front < rear)
   * Line 31-32: int u = queue[front++]; result[count++] = u;
   * Line 34: for (int v = 0; v < n; v++)
   * Line 36-44: if (graph[u][v] == 1) { indegree[v]--; if (indegree[v] == 0) queue[rear++] = v; }
   * Line 47-59: Cycle Check: if (count != n) Cycle detected else print topological order
   */
  static runKahnsAlgorithm(graph) {
    const steps = [];
    const nodes = graph.nodes;
    const edges = graph.edges;
    const n = nodes.length;

    if (n === 0) {
      return [{
        stepNumber: 1,
        title: "Empty Graph",
        description: "The graph has no vertices to sort.",
        nodeStates: {},
        edgeStates: {},
        indegrees: {},
        queue: [],
        result: [],
        cCodeLine: 1,
        isCycle: false,
        stats: { totalNodes: 0, totalEdges: 0, processedCount: 0, isSuccess: true }
      }];
    }

    // Node & Edge state trackers
    const nodeStates = {};
    const edgeStates = {};
    nodes.forEach(node => { nodeStates[node.id] = 'unvisited'; });
    edges.forEach(edge => { edgeStates[`${edge.from}->${edge.to}`] = 'default'; });

    // 1. Initial State
    const currentIndegrees = graph.calculateIndegrees();
    const queue = [];
    const result = [];
    let stepCount = 1;

    steps.push({
      stepNumber: stepCount++,
      title: "Step 1: Graph Initialization & Indegree Calculation",
      description: `Graph contains ${n} vertices and ${edges.length} edges. Initial in-degrees have been computed for all vertices.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      indegrees: { ...currentIndegrees },
      queue: [...queue],
      result: [...result],
      cCodeLine: 18, // indegree[v]++
      isCycle: false,
      stats: { totalNodes: n, totalEdges: edges.length, processedCount: 0, isSuccess: null }
    });

    // 2. Find vertices with in-degree 0 and enqueue
    const initialZeroIndegreeNodes = nodes.filter(node => currentIndegrees[node.id] === 0);

    if (initialZeroIndegreeNodes.length === 0) {
      // Immediate cycle / no starting vertex
      nodes.forEach(node => { nodeStates[node.id] = 'cycle'; });
      edges.forEach(edge => { edgeStates[`${edge.from}->${edge.to}`] = 'cycle'; });

      steps.push({
        stepNumber: stepCount++,
        title: "Cycle Detected! No In-degree 0 Vertex",
        description: `No vertex has an in-degree of 0. Every vertex depends on some other vertex, forming a directed cycle. Topological sort cannot proceed.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: { ...currentIndegrees },
        queue: [],
        result: [],
        cCodeLine: 48, // Cycle detected
        isCycle: true,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: 0, isSuccess: false }
      });
      return steps;
    }

    // Enqueue initial zero indegree vertices
    initialZeroIndegreeNodes.forEach(node => {
      queue.push(node.id);
      nodeStates[node.id] = 'queue';
    });

    steps.push({
      stepNumber: stepCount++,
      title: "Step 2: Enqueue In-degree 0 Vertices",
      description: `Identified initial vertices with in-degree 0: [${initialZeroIndegreeNodes.map(n => n.label).join(', ')}]. Pushed them into the FIFO queue.`,
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      indegrees: { ...currentIndegrees },
      queue: [...queue],
      result: [...result],
      cCodeLine: 25, // queue[rear++] = i;
      isCycle: false,
      stats: { totalNodes: n, totalEdges: edges.length, processedCount: 0, isSuccess: null }
    });

    // 3. Process Queue (BFS)
    const adj = graph.getAdjacencyList();

    while (queue.length > 0) {
      const uId = queue.shift();
      const uNode = graph.getNodeById(uId);

      // Node is now active / being processed
      nodeStates[uId] = 'active';

      steps.push({
        stepNumber: stepCount++,
        title: `Step 3: Dequeue Vertex ${uNode.label}`,
        description: `Removed vertex ${uNode.label} from the front of the queue. Adding it to the topological ordering result list.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: { ...currentIndegrees },
        queue: [...queue],
        result: [...result],
        cCodeLine: 31, // int u = queue[front++];
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: result.length, isSuccess: null }
      });

      // Add to result
      result.push(uId);
      nodeStates[uId] = 'done';

      steps.push({
        stepNumber: stepCount++,
        title: `Added ${uNode.label} to Topological Order`,
        description: `Vertex ${uNode.label} is finalized in topological order. Now inspecting all outgoing edges from ${uNode.label}.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: { ...currentIndegrees },
        queue: [...queue],
        result: [...result],
        cCodeLine: 32, // result[count++] = u;
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: result.length, isSuccess: null }
      });

      // Inspect adjacent vertices
      const neighbors = adj[uId] || [];

      for (let vId of neighbors) {
        const vNode = graph.getNodeById(vId);
        const edgeKey = `${uId}->${vId}`;
        edgeStates[edgeKey] = 'active';

        // Decrement in-degree
        const oldIndegree = currentIndegrees[vId];
        currentIndegrees[vId]--;
        const newIndegree = currentIndegrees[vId];

        steps.push({
          stepNumber: stepCount++,
          title: `Reduce In-degree: ${uNode.label} → ${vNode.label}`,
          description: `Decremented in-degree of vertex ${vNode.label} from ${oldIndegree} to ${newIndegree} after removing incoming dependency from ${uNode.label}.`,
          nodeStates: { ...nodeStates },
          edgeStates: { ...edgeStates },
          indegrees: { ...currentIndegrees },
          queue: [...queue],
          result: [...result],
          cCodeLine: 38, // indegree[v]--;
          isCycle: false,
          stats: { totalNodes: n, totalEdges: edges.length, processedCount: result.length, isSuccess: null }
        });

        edgeStates[edgeKey] = 'done';

        // If in-degree became 0, push to queue
        if (newIndegree === 0) {
          queue.push(vId);
          nodeStates[vId] = 'queue';

          steps.push({
            stepNumber: stepCount++,
            title: `Enqueue Ready Vertex ${vNode.label}`,
            description: `Vertex ${vNode.label}'s in-degree reached 0. All prerequisite dependencies resolved. Pushed ${vNode.label} into queue.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            indegrees: { ...currentIndegrees },
            queue: [...queue],
            result: [...result],
            cCodeLine: 41, // queue[rear++] = v;
            isCycle: false,
            stats: { totalNodes: n, totalEdges: edges.length, processedCount: result.length, isSuccess: null }
          });
        }
      }
    }

    // 4. Final Verification / Cycle Detection Check
    const isCycle = result.length !== n;

    if (isCycle) {
      // Find remaining unprocessed vertices and mark as cycle
      const unvisitedNodes = nodes.filter(n => !result.includes(n.id));
      unvisitedNodes.forEach(node => {
        nodeStates[node.id] = 'cycle';
      });
      edges.forEach(edge => {
        if (!result.includes(edge.from) || !result.includes(edge.to)) {
          edgeStates[`${edge.from}->${edge.to}`] = 'cycle';
        }
      });

      steps.push({
        stepNumber: stepCount++,
        title: "Cycle Detected! Topological Sort Incomplete",
        description: `Queue became empty but only ${result.length}/${n} vertices were processed. Graph contains at least one directed cycle among vertices: [${unvisitedNodes.map(n => n.label).join(', ')}]. Topological sort is impossible.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: { ...currentIndegrees },
        queue: [],
        result: [...result],
        cCodeLine: 48, // printf("Cycle detected!...")
        isCycle: true,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: result.length, isSuccess: false }
      });
    } else {
      const orderLabels = result.map(id => graph.getNodeById(id).label).join(' → ');
      steps.push({
        stepNumber: stepCount++,
        title: "Topological Sort Complete! (DAG Validated)",
        description: `All ${n} vertices successfully ordered with zero cycles. Valid Topological Order: ${orderLabels}`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: { ...currentIndegrees },
        queue: [],
        result: [...result],
        cCodeLine: 54, // printf("Topological Order:...")
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: n, isSuccess: true }
      });
    }

    return steps;
  }

  /**
   * Generates step-by-step frames for DFS-based Topological Sort
   * Uses recursion stack and post-order stack reversal
   */
  static runDFSSort(graph) {
    const steps = [];
    const nodes = graph.nodes;
    const edges = graph.edges;
    const n = nodes.length;

    if (n === 0) return [];

    const visited = {}; // 0 = unvisited, 1 = visiting (in recursion stack / gray), 2 = visited (black)
    const stack = [];
    const nodeStates = {};
    const edgeStates = {};
    let hasCycle = false;
    let stepCount = 1;

    nodes.forEach(node => {
      visited[node.id] = 0;
      nodeStates[node.id] = 'unvisited';
    });
    edges.forEach(edge => {
      edgeStates[`${edge.from}->${edge.to}`] = 'default';
    });

    steps.push({
      stepNumber: stepCount++,
      title: "DFS Initialization",
      description: "Initialize DFS traversal. All vertices marked as UNVISITED. Prepare call stack and output stack.",
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      indegrees: graph.calculateIndegrees(),
      queue: [],
      stack: [],
      result: [],
      cCodeLine: 1,
      isCycle: false,
      stats: { totalNodes: n, totalEdges: edges.length, processedCount: 0, isSuccess: null }
    });

    const adj = graph.getAdjacencyList();

    function dfs(uId) {
      if (hasCycle) return;
      visited[uId] = 1; // Visiting (in active recursion stack)
      nodeStates[uId] = 'active';
      const uNode = graph.getNodeById(uId);

      steps.push({
        stepNumber: stepCount++,
        title: `DFS Visit: Vertex ${uNode.label}`,
        description: `Visiting vertex ${uNode.label}. Pushed to call stack (visiting state). Exploring unvisited neighbors.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: graph.calculateIndegrees(),
        queue: [],
        stack: [...stack],
        result: [...stack].reverse(),
        cCodeLine: 15, // dfs_visit()
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: stack.length, isSuccess: null }
      });

      const neighbors = adj[uId] || [];
      for (let vId of neighbors) {
        if (hasCycle) return;
        const vNode = graph.getNodeById(vId);
        const edgeKey = `${uId}->${vId}`;
        edgeStates[edgeKey] = 'active';

        if (visited[vId] === 1) {
          // Back-edge detected! Directed cycle
          hasCycle = true;
          nodeStates[vId] = 'cycle';
          nodeStates[uId] = 'cycle';
          edgeStates[edgeKey] = 'cycle';

          steps.push({
            stepNumber: stepCount++,
            title: `Cycle Detected via Back-Edge! (${uNode.label} → ${vNode.label})`,
            description: `Encountered vertex ${vNode.label} which is currently in the active recursion call stack. This back-edge confirms a cycle.`,
            nodeStates: { ...nodeStates },
            edgeStates: { ...edgeStates },
            indegrees: graph.calculateIndegrees(),
            queue: [],
            stack: [...stack],
            result: [],
            cCodeLine: 20, // cycle detected in DFS
            isCycle: true,
            stats: { totalNodes: n, totalEdges: edges.length, processedCount: 0, isSuccess: false }
          });
          return;
        }

        if (visited[vId] === 0) {
          dfs(vId);
        }
        edgeStates[edgeKey] = 'done';
      }

      if (hasCycle) return;

      visited[uId] = 2; // Fully visited
      nodeStates[uId] = 'done';
      stack.push(uId);

      steps.push({
        stepNumber: stepCount++,
        title: `Post-Order: Push ${uNode.label} to Output Stack`,
        description: `All descendants of ${uNode.label} have been explored. Pushing ${uNode.label} into the topological output stack.`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: graph.calculateIndegrees(),
        queue: [],
        stack: [...stack],
        result: [...stack].reverse(),
        cCodeLine: 25, // push_stack(u)
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: stack.length, isSuccess: null }
      });
    }

    // Run DFS for all unvisited components
    for (let node of nodes) {
      if (visited[node.id] === 0 && !hasCycle) {
        dfs(node.id);
      }
    }

    if (!hasCycle) {
      const finalOrder = [...stack].reverse();
      const orderLabels = finalOrder.map(id => graph.getNodeById(id).label).join(' → ');

      steps.push({
        stepNumber: stepCount++,
        title: "DFS Topological Sort Complete!",
        description: `Popping elements from stack yields valid Topological Order: ${orderLabels}`,
        nodeStates: { ...nodeStates },
        edgeStates: { ...edgeStates },
        indegrees: graph.calculateIndegrees(),
        queue: [],
        stack: [...stack],
        result: finalOrder,
        cCodeLine: 35, // pop stack to print result
        isCycle: false,
        stats: { totalNodes: n, totalEdges: edges.length, processedCount: n, isSuccess: true }
      });
    }

    return steps;
  }
}

window.TopologicalSortEngine = TopologicalSortEngine;
