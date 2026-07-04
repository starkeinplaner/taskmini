const STORAGE_KEY = "meister-mini-data-v1";

const defaultData = {
  currentProjectId: "p_ihk",
  projects: [
    {
      id: "p_ihk",
      name: "IHK Meister",
      columns: [
        {
          id: "c_open",
          title: "Offen",
          tasks: [
            {
              id: "t_aevo",
              title: "AEVO-Unterweisung vorbereiten",
              description: "Leitung zurichten und verbinden.",
              notes: "Hier kannst du später Lernziele, Material und Hinweise ergänzen.",
              checklist: [
                { id: "ci_1", text: "Feinlernziel formulieren", checked: true },
                { id: "ci_2", text: "Materialliste erstellen", checked: false },
                { id: "ci_3", text: "Sicherheitsunterweisung ergänzen", checked: false }
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        },
        { id: "c_progress", title: "In Arbeit", tasks: [] },
        { id: "c_done", title: "Erledigt", tasks: [] }
      ]
    },
    {
      id: "p_private",
      name: "Privat",
      columns: [
        { id: "c_p_open", title: "Offen", tasks: [] },
        { id: "c_p_progress", title: "In Arbeit", tasks: [] },
        { id: "c_p_done", title: "Erledigt", tasks: [] }
      ]
    }
  ]
};

let state = loadState();
let selectedTaskRef = null;

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(defaultData));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefaultData();
    const parsed = JSON.parse(raw);
    if (!parsed.projects?.length) return cloneDefaultData();
    return parsed;
  } catch {
    return cloneDefaultData();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function closeDetail() {
  selectedTaskRef = null;
  document.querySelectorAll(".detail-backdrop").forEach(panel => panel.remove());
  render();
}

document.addEventListener("click", event => {
  const closeButton = event.target.closest("[data-close-detail]");
  if (closeButton) {
    event.preventDefault();
    event.stopPropagation();
    closeDetail();
    return;
  }

  if (event.target.classList?.contains("detail-backdrop")) {
    event.preventDefault();
    event.stopPropagation();
    closeDetail();
  }
}, true);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && selectedTaskRef) {
    closeDetail();
  }
});

function currentProject() {
  return state.projects.find(p => p.id === state.currentProjectId) ?? state.projects[0];
}

function findTask(taskId) {
  for (const project of state.projects) {
    for (const column of project.columns) {
      const taskIndex = column.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        return { project, column, task: column.tasks[taskIndex], taskIndex };
      }
    }
  }
  return null;
}

function checklistProgress(task) {
  const total = task.checklist?.length ?? 0;
  const done = task.checklist?.filter(item => item.checked).length ?? 0;
  return { total, done };
}

function countProjectTasks(project) {
  return project.columns.reduce((sum, column) => sum + column.tasks.length, 0);
}

function render() {
  document.querySelectorAll(".detail-backdrop").forEach(panel => panel.remove());

  const app = document.querySelector("#app");
  const project = currentProject();

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="logo">M</div>
          <div>
            <h1>Meister Mini</h1>
            <p>Projekte · Aufgaben · Checklisten</p>
          </div>
        </div>

        <form class="project-form" id="projectForm">
          <input id="projectName" placeholder="Neues Projekt" autocomplete="off" />
          <button type="submit">+</button>
        </form>

        <div class="project-list">
          ${state.projects.map(p => {
            const count = p.columns.reduce((sum, c) => sum + c.tasks.length, 0);
            return `
              <button type="button" class="project-item ${p.id === project.id ? "active" : ""}" data-project-id="${p.id}">
                <span>${escapeHTML(p.name)}</span>
                <small>${count} Aufgabe${count === 1 ? "" : "n"}</small>
              </button>
            `;
          }).join("")}
        </div>

        <div class="sidebar-actions">
          <button type="button" class="secondary" id="exportBtn">Backup exportieren</button>
          <label>
            <input class="file-input" id="importInput" type="file" accept="application/json" />
            <button type="button" class="secondary" id="importBtn">Backup importieren</button>
          </label>
          <button type="button" class="danger" id="deleteProjectBtn" ${state.projects.length <= 1 ? "disabled title='Mindestens ein Projekt muss bleiben'" : ""}>Aktuelles Projekt löschen</button>
          <p class="small-note">Speicherung aktuell lokal im Browser. Exportiere ab und zu ein Backup.</p>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div>
            <h2>${escapeHTML(project.name)}</h2>
            <p>${project.columns.length} Spalten · ${project.columns.reduce((sum, c) => sum + c.tasks.length, 0)} Aufgaben</p>
          </div>
          <form class="quick-row" id="columnForm">
            <input id="columnTitle" placeholder="Neue Spalte" autocomplete="off" />
            <button type="submit">Spalte +</button>
          </form>
        </div>

        <div class="board">
          ${project.columns.map((column, columnIndex) => renderColumn(column, columnIndex)).join("")}
        </div>
      </main>
    </div>
  `;

  bindEvents();

  if (selectedTaskRef) {
    renderDetailPanel(selectedTaskRef.taskId);
  }
}

function renderColumn(column, columnIndex) {
  return `
    <section class="column">
      <div class="column-header">
        <div class="column-title">${escapeHTML(column.title)}</div>
        <span class="counter">${column.tasks.length}</span>
      </div>

      <div class="task-list" data-drop-column="${column.id}">
        ${column.tasks.length ? column.tasks.map(task => renderTaskCard(task)).join("") : ""}
      </div>

      <form class="add-row add-task" data-add-task-column="${column.id}">
        <input placeholder="Neue Aufgabe" autocomplete="off" />
        <button type="submit">+</button>
      </form>

      <div class="move-row" style="margin-top: 10px;">
        <button type="button" class="ghost" data-column-left="${column.id}" ${columnIndex === 0 ? "disabled" : ""}>←</button>
        <button type="button" class="ghost" data-column-right="${column.id}" ${columnIndex === currentProject().columns.length - 1 ? "disabled" : ""}>→</button>
        <button type="button" class="ghost danger" data-delete-column="${column.id}" ${currentProject().columns.length <= 1 ? "disabled title='Mindestens eine Spalte muss bleiben'" : ""}>Löschen</button>
      </div>
    </section>
  `;
}

function renderTaskCard(task) {
  const progress = checklistProgress(task);
  const hasNotes = task.notes?.trim().length > 0;
  const hasDescription = task.description?.trim().length > 0;

  return `
    <div class="task-card" data-task-id="${task.id}" draggable="true" role="button" tabindex="0">
      <div class="task-title">${escapeHTML(task.title)}</div>
      <div class="task-meta">
        <span class="pill">☑ ${progress.done}/${progress.total}</span>
        ${hasDescription ? `<span class="pill">Beschreibung</span>` : ""}
        ${hasNotes ? `<span class="pill">Notizen</span>` : ""}
      </div>
    </div>
  `;
}

function renderDetailPanel(taskId) {
  const found = findTask(taskId);
  if (!found) {
    selectedTaskRef = null;
    return;
  }

  const { project, column, task } = found;
  const progress = checklistProgress(task);
  const backdrop = document.createElement("div");
  backdrop.className = "detail-backdrop";
  backdrop.setAttribute("data-detail-backdrop", "true");

  backdrop.innerHTML = `
    <aside class="detail-panel" role="dialog" aria-modal="true">
      <div class="detail-header">
        <div>
          <h2>${escapeHTML(task.title || "Aufgabe")}</h2>
          <p class="small-note">${escapeHTML(project.name)} · ${escapeHTML(column.title)} · Checkliste ${progress.done}/${progress.total}</p>
        </div>
        <button type="button" class="secondary close-button" data-close-detail="true" aria-label="Aufgabe schließen">Schließen</button>
      </div>

      <div class="form-section">
        <label for="taskTitle">Titel</label>
        <input id="taskTitle" value="${escapeAttr(task.title)}" />
      </div>

      <div class="form-section">
        <label for="taskDescription">Beschreibung</label>
        <textarea id="taskDescription" placeholder="Kurze Beschreibung der Aufgabe">${escapeHTML(task.description ?? "")}</textarea>
      </div>

      <div class="form-section">
        <label>Checkliste / Unterpunkte</label>
        <div class="checklist">
          ${(task.checklist ?? []).map(item => `
            <div class="check-item ${item.checked ? "done" : ""}">
              <input type="checkbox" data-check-id="${item.id}" ${item.checked ? "checked" : ""} />
              <input class="check-text" data-check-text="${item.id}" value="${escapeAttr(item.text)}" />
              <button type="button" class="ghost danger" data-delete-check="${item.id}">×</button>
            </div>
          `).join("")}
        </div>
        <form class="add-row" id="checkForm">
          <input id="newCheckText" placeholder="Neuer Unterpunkt" autocomplete="off" />
          <button type="submit">+</button>
        </form>
      </div>

      <div class="form-section">
        <label for="taskNotes">Notizen</label>
        <textarea id="taskNotes" placeholder="Notizen, Ideen, Lernpunkte, Links …">${escapeHTML(task.notes ?? "")}</textarea>
      </div>

      <div class="form-section">
        <label>Aufgabe verschieben</label>
        <div class="move-row">
          ${project.columns.map(c => `
            <button type="button" class="secondary" data-move-task-to="${c.id}" ${c.id === column.id ? "disabled" : ""}>${escapeHTML(c.title)}</button>
          `).join("")}
        </div>
      </div>

      <button type="button" class="danger" id="deleteTask">Aufgabe löschen</button>
    </aside>
  `;

  document.body.appendChild(backdrop);
  bindDetailEvents(task.id);
}

function bindEvents() {
  document.querySelectorAll("[data-project-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentProjectId = btn.dataset.projectId;
      selectedTaskRef = null;
      saveState();
      render();
    });
  });

  document.querySelector("#projectForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = document.querySelector("#projectName");
    const name = input.value.trim();
    if (!name) return;

    const newProject = {
      id: uid("p"),
      name,
      columns: [
        { id: uid("c"), title: "Offen", tasks: [] },
        { id: uid("c"), title: "In Arbeit", tasks: [] },
        { id: uid("c"), title: "Erledigt", tasks: [] }
      ]
    };

    state.projects.push(newProject);
    state.currentProjectId = newProject.id;
    saveState();
    render();
  });

  document.querySelector("#columnForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = document.querySelector("#columnTitle");
    const title = input.value.trim();
    if (!title) return;
    currentProject().columns.push({ id: uid("c"), title, tasks: [] });
    saveState();
    render();
  });

  document.querySelectorAll("[data-add-task-column]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const input = form.querySelector("input");
      const title = input.value.trim();
      if (!title) return;

      const column = currentProject().columns.find(c => c.id === form.dataset.addTaskColumn);
      column.tasks.push({
        id: uid("t"),
        title,
        description: "",
        notes: "",
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-task-id]").forEach(card => {
    card.addEventListener("click", () => {
      if (card.dataset.dragging === "true") return;
      selectedTaskRef = { taskId: card.dataset.taskId };
      render();
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectedTaskRef = { taskId: card.dataset.taskId };
        render();
      }
    });

    card.addEventListener("dragstart", event => {
      card.dataset.dragging = "true";
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", card.dataset.taskId);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      setTimeout(() => {
        card.dataset.dragging = "false";
      }, 0);
      document.querySelectorAll(".task-list.drop-target").forEach(list => {
        list.classList.remove("drop-target");
      });
    });
  });

  document.querySelectorAll("[data-drop-column]").forEach(list => {
    list.addEventListener("dragover", event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      list.classList.add("drop-target");
    });

    list.addEventListener("dragleave", event => {
      if (!list.contains(event.relatedTarget)) {
        list.classList.remove("drop-target");
      }
    });

    list.addEventListener("drop", event => {
      event.preventDefault();
      list.classList.remove("drop-target");
      const taskId = event.dataTransfer.getData("text/plain");
      const targetColumnId = list.dataset.dropColumn;
      moveTaskToColumn(taskId, targetColumnId);
    });
  });

  document.querySelectorAll("[data-column-left]").forEach(btn => {
    btn.addEventListener("click", () => moveColumn(btn.dataset.columnLeft, -1));
  });

  document.querySelectorAll("[data-column-right]").forEach(btn => {
    btn.addEventListener("click", () => moveColumn(btn.dataset.columnRight, 1));
  });

  document.querySelectorAll("[data-delete-column]").forEach(btn => {
    btn.addEventListener("click", () => {
      const project = currentProject();
      const column = project.columns.find(c => c.id === btn.dataset.deleteColumn);
      if (!column) return;

      if (project.columns.length <= 1) {
        alert("Mindestens eine Spalte muss bleiben.");
        return;
      }

      const taskCount = column.tasks.length;
      const message = taskCount > 0
        ? `Die Spalte „${column.title}“ enthält ${taskCount} Aufgabe${taskCount === 1 ? "" : "n"}. Wenn du sie löschst, werden diese Aufgaben ebenfalls gelöscht. Wirklich löschen?`
        : `Spalte „${column.title}“ wirklich löschen?`;

      if (!confirm(message)) return;

      project.columns = project.columns.filter(c => c.id !== column.id);
      selectedTaskRef = null;
      saveState();
      render();
    });
  });

  document.querySelector("#exportBtn")?.addEventListener("click", exportData);
  document.querySelector("#importBtn")?.addEventListener("click", () => document.querySelector("#importInput").click());
  document.querySelector("#importInput")?.addEventListener("change", importData);
  document.querySelector("#deleteProjectBtn")?.addEventListener("click", deleteCurrentProject);
}

function bindDetailEvents(taskId) {
  const found = findTask(taskId);
  if (!found) return;

  const { column, task } = found;

  document.querySelector("#taskTitle")?.addEventListener("input", event => {
    task.title = event.target.value;
    task.updatedAt = new Date().toISOString();
    saveState();
  });

  document.querySelector("#taskDescription")?.addEventListener("input", event => {
    task.description = event.target.value;
    task.updatedAt = new Date().toISOString();
    saveState();
  });

  document.querySelector("#taskNotes")?.addEventListener("input", event => {
    task.notes = event.target.value;
    task.updatedAt = new Date().toISOString();
    saveState();
  });

  document.querySelectorAll("[data-check-id]").forEach(input => {
    input.addEventListener("change", () => {
      const item = task.checklist.find(ci => ci.id === input.dataset.checkId);
      if (!item) return;
      item.checked = input.checked;
      task.updatedAt = new Date().toISOString();
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-check-text]").forEach(input => {
    input.addEventListener("input", () => {
      const item = task.checklist.find(ci => ci.id === input.dataset.checkText);
      if (!item) return;
      item.text = input.value;
      task.updatedAt = new Date().toISOString();
      saveState();
    });
  });

  document.querySelectorAll("[data-delete-check]").forEach(btn => {
    btn.addEventListener("click", () => {
      task.checklist = task.checklist.filter(ci => ci.id !== btn.dataset.deleteCheck);
      task.updatedAt = new Date().toISOString();
      saveState();
      render();
    });
  });

  document.querySelector("#checkForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const input = document.querySelector("#newCheckText");
    const text = input.value.trim();
    if (!text) return;

    task.checklist ??= [];
    task.checklist.push({ id: uid("ci"), text, checked: false });
    task.updatedAt = new Date().toISOString();
    saveState();
    render();
  });

  document.querySelectorAll("[data-move-task-to]").forEach(btn => {
    btn.addEventListener("click", () => {
      moveTaskToColumn(task.id, btn.dataset.moveTaskTo);
      selectedTaskRef = { taskId: task.id };
      render();
    });
  });

  document.querySelector("#deleteTask")?.addEventListener("click", () => {
    column.tasks = column.tasks.filter(t => t.id !== task.id);
    selectedTaskRef = null;
    saveState();
    render();
  });
}

function deleteCurrentProject() {
  const project = currentProject();
  if (!project) return;

  if (state.projects.length <= 1) {
    alert("Mindestens ein Projekt muss bleiben.");
    return;
  }

  const taskCount = countProjectTasks(project);
  const message = taskCount > 0
    ? `Das Projekt „${project.name}“ enthält ${taskCount} Aufgabe${taskCount === 1 ? "" : "n"}. Wenn du es löschst, werden alle Spalten und Aufgaben darin gelöscht. Wirklich löschen?`
    : `Projekt „${project.name}“ wirklich löschen?`;

  if (!confirm(message)) return;

  state.projects = state.projects.filter(p => p.id !== project.id);
  state.currentProjectId = state.projects[0]?.id ?? null;
  selectedTaskRef = null;
  saveState();
  render();
}

function moveTaskToColumn(taskId, targetColumnId) {
  const project = currentProject();
  const source = findTask(taskId);
  if (!source) return;

  const targetColumn = project.columns.find(c => c.id === targetColumnId);
  if (!targetColumn) return;
  if (source.column.id === targetColumn.id) return;

  source.column.tasks = source.column.tasks.filter(task => task.id !== taskId);
  source.task.updatedAt = new Date().toISOString();
  targetColumn.tasks.push(source.task);

  saveState();
  render();
}

function moveColumn(columnId, direction) {
  const columns = currentProject().columns;
  const index = columns.findIndex(c => c.id === columnId);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= columns.length) return;
  const [column] = columns.splice(index, 1);
  columns.splice(targetIndex, 0, column);
  saveState();
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `meister-mini-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!imported.projects?.length) throw new Error("Ungültiges Backup");
      state = imported;
      state.currentProjectId = state.currentProjectId || state.projects[0].id;
      selectedTaskRef = null;
      saveState();
      render();
    } catch {
      alert("Das Backup konnte nicht gelesen werden.");
    }
  };
  reader.readAsText(file);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHTML(value).replaceAll("\n", " ");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
