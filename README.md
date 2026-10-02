# Topological Sort Visualizer – Data Structures in C

An interactive, responsive educational website designed for college **Data Structures and Algorithms (DSA)** students to learn, visualize, and practice **Topological Sorting on Directed Acyclic Graphs (DAG)** using **C programming**.

---

## 🌟 Key Features

1. **Interactive SVG Graph Builder**
   - Click to add vertices or drag directed edges with dynamic SVG arrow markers.
   - Smooth vertex dragging, delete tool, duplicate edge prevention, and clear canvas.
   - Built-in presets: *Classic 6-Node DAG*, *Course Prerequisites*, *Cyclic Graph (Cycle detection demo)*, *Diamond Graph*, and *Linear Chain*.
   - Plain text import/export format support.

2. **Step-by-Step Visualization Engine**
   - Supports **Kahn’s Algorithm (In-degree & BFS Queue)** and **DFS Method (Post-order & Stack)**.
   - Full playback controls: Play, Pause, Step Forward, Step Backward, Reset, and Speed Slider (0.5x to 3.0x).
   - High-contrast visual state badges: In-degree 0 (Cyan), Queue/Stack (Amber), Processing (Orange), Sorted (Green), and Cycle Conflict (Red).

3. **Live Synchronized Data Structures**
   - **In-degree Tracker Table:** Updates initial and current in-degrees at each step.
   - **Queue / Stack Container:** Animated FIFO/LIFO blocks with `FRONT`, `REAR`, and `TOP` pointers.
   - **Topological Order Bar:** Live sequence progression ($A \to B \to C \dots$).
   - **C Code Execution Tracer:** Synchronized line-by-line highlight of the active line in C code.
   - **Output & Correctness Report:** Vertices count, edge count, cycle status, processed ratio, and final order.

4. **C Program Hub & Simulator**
   - Complete C source code for:
     - Kahn’s Algorithm using **Adjacency Matrix**
     - Kahn’s Algorithm using **Adjacency List**
     - DFS Topological Sort using **Call Stack & Post-order Array**
   - Interactive memory & variable breakdown (`graph[][]`, `indegree[]`, `queue[]`, `front`, `rear`, `result[]`).
   - Browser-based C terminal simulator allowing custom $V, E$ and edge input.

5. **Self-Assessment & Practice**
   - Interactive MCQ quiz with instant scoring and explanations.
   - Interactive DAG Sorting Challenge mini-game with dependency checking.
   - University exam questions with revealable model answers.

---

## 📂 Project Structure

```text
topological-sort-c/
│
├── index.html              # Home page with hero, interactive preview, & feature overview
├── learn.html              # Comprehensive tutorial (DAGs, Kahn's algorithm, DFS, Cycle detection)
├── visualizer.html         # Interactive Graph Builder & Step-by-Step Visualizer
├── c-program.html          # Clean C Programs, code breakdown & browser C simulator
├── practice.html           # Interactive quiz, DAG sorting challenge & university exam review
│
├── css/
│   └── style.css           # Complete responsive CSS design system (Dark & Light themes)
│
├── js/
│   ├── graph.js            # DirectedGraph data structure, adjacency matrix/list & SVG renderer
│   ├── topological-sort.js # Step generator engine for Kahn's & DFS algorithms
│   ├── visualization.js    # Visualizer playback controller & dynamic panel updates
│   └── main.js             # Global theme management, navigation, quiz runner & simulator
│
└── README.md               # Setup and usage guide
```

---

## 🚀 How to Run in VS Code (Live Server)

1. Open **VS Code**.
2. Open the `topological-sort-c` folder (`File` > `Open Folder...`).
3. If not already installed, install the **Live Server** extension by Ritwick Dey from the VS Code Extensions Marketplace (`Ctrl+Shift+X` and search for "Live Server").
4. Right-click `index.html` in the file explorer.
5. Select **"Open with Live Server"**.
6. The website will automatically launch in your default web browser at `http://127.0.0.1:5500/index.html`.

---

## 🛠️ Technologies Used

- **HTML5:** Semantic markup and SVG rendering.
- **CSS3:** Custom properties for dynamic Dark/Light themes, responsive grid/flexbox layouts, animations.
- **JavaScript (ES6+):** Pure Vanilla JS with zero external framework/build dependencies.
- **C Language:** Complete algorithmic implementations for adjacency matrices and lists.

---

## 🎓 Target Audience

- College & University Computer Science and IT students.
- Data Structures & Algorithms (DSA) educators and lecturers.
- Software engineering interview preparation.
