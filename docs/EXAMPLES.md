# 🔧 Exemplos de Extensão - FF Executive Project

Guia prático com exemplos de como estender a funcionalidade da aplicação.

## 1️⃣ Adicionar Novo Módulo

### Criar Um Novo Módulo de Filtro

```javascript
// src/js/AdvancedFilter.js

/**
 * AdvancedFilter - Filtros avançados por múltiplos critérios
 */
class AdvancedFilter {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.filters = {
      status: null,
      responsible: null,
      minProgress: 0,
      maxProgress: 100,
      dateRange: { start: null, end: null }
    };
  }

  /**
   * Aplica todos os filtros
   */
  apply() {
    let tasks = this.dataLoader.getTasks();

    if (this.filters.status) {
      tasks = tasks.filter(t => t.status === this.filters.status);
    }

    if (this.filters.responsible) {
      tasks = tasks.filter(t => t.responsible === this.filters.responsible);
    }

    tasks = tasks.filter(t => 
      t.progress >= this.filters.minProgress && 
      t.progress <= this.filters.maxProgress
    );

    if (this.filters.dateRange.start) {
      tasks = tasks.filter(t => new Date(t.start) >= this.filters.dateRange.start);
    }

    if (this.filters.dateRange.end) {
      tasks = tasks.filter(t => new Date(t.end) <= this.filters.dateRange.end);
    }

    return tasks.map(task => ({
      Task: task.name,
      Start: new Date(task.start),
      End: new Date(task.end),
      Progress: task.progress,
      Status: task.status,
      Responsible: task.responsible
    }));
  }

  setStatusFilter(status) {
    this.filters.status = status;
    return this;
  }

  setResponsibleFilter(responsible) {
    this.filters.responsible = responsible;
    return this;
  }

  setProgressRange(min, max) {
    this.filters.minProgress = min;
    this.filters.maxProgress = max;
    return this;
  }

  setDateRange(start, end) {
    this.filters.dateRange = { start, end };
    return this;
  }

  reset() {
    this.filters = {
      status: null,
      responsible: null,
      minProgress: 0,
      maxProgress: 100,
      dateRange: { start: null, end: null }
    };
    return this;
  }
}
```

### Usar o Novo Módulo

```javascript
// No index.html
<script src="src/js/AdvancedFilter.js"></script>

// No App.js
const filter = new AdvancedFilter(this.dataLoader);
filter.setStatusFilter('in-progress')
      .setProgressRange(50, 100);

const filteredData = filter.apply();
this.chartBuilder.updateChart(filteredData);
```

---

## 2️⃣ Adicionar Novo Tipo de Gráfico

```javascript
// src/js/TimelineView.js

class TimelineView {
  constructor(containerId) {
    this.containerId = containerId;
  }

  buildTimeline(tasks) {
    const trace = {
      x: tasks.map(t => new Date(t.Start)),
      y: tasks.map(t => t.Task),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: tasks.map(t => {
          const colors = {
            'completed': 'green',
            'in-progress': 'blue',
            'not-started': 'gray'
          };
          return colors[t.Status] || 'gray';
        })
      }
    };

    const layout = {
      title: 'Timeline do Projeto',
      xaxis: { title: 'Data' },
      yaxis: { title: 'Tarefas' }
    };

    Plotly.newPlot(this.containerId, [trace], layout);
  }
}
```

---

## 3️⃣ Adicionar Persistência (LocalStorage)

```javascript
// src/js/StorageManager.js

class StorageManager {
  constructor(storageKey = 'ffProject') {
    this.storageKey = storageKey;
  }

  /**
   * Salva dados no localStorage
   */
  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('Dados salvos com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  /**
   * Carrega dados do localStorage
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  }

  /**
   * Remove dados do localStorage
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      return false;
    }
  }

  /**
   * Carrega com fallback
   */
  async loadWithFallback(dataLoader) {
    const cached = this.load();
    if (cached) {
      console.log('Dados carregados do cache');
      return cached;
    }
    
    const fresh = await dataLoader.load();
    this.save(fresh);
    return fresh;
  }
}
```

---

## 4️⃣ Adicionar Notificações Avançadas

```javascript
// src/js/NotificationCenter.js

class NotificationCenter {
  constructor() {
    this.notifications = [];
    this.container = null;
  }

  init() {
    if (!document.getElementById('notification-center')) {
      this.container = document.createElement('div');
      this.container.id = 'notification-center';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Mostra notificação com ações
   */
  show(message, type = 'info', actions = []) {
    const notifId = Date.now();
    
    const notifEl = document.createElement('div');
    notifEl.className = `notification notification-${type}`;
    notifEl.id = `notif-${notifId}`;
    notifEl.style.cssText = `
      padding: 20px;
      background: ${this._getColor(type)};
      color: white;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      animation: slideIn 0.3s ease-out;
    `;

    const messageEl = document.createElement('span');
    messageEl.textContent = message;

    const actionsContainer = document.createElement('div');
    actionsContainer.style.cssText = 'display: flex; gap: 10px;';

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.textContent = action.label;
      btn.style.cssText = `
        padding: 5px 10px;
        background: rgba(255,255,255,0.3);
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      `;
      btn.onclick = action.callback;
      actionsContainer.appendChild(btn);
    });

    notifEl.appendChild(messageEl);
    if (actions.length > 0) {
      notifEl.appendChild(actionsContainer);
    }

    this.container.appendChild(notifEl);
    this.notifications.push(notifId);

    setTimeout(() => this.dismiss(notifId), 5000);
  }

  dismiss(notifId) {
    const el = document.getElementById(`notif-${notifId}`);
    if (el) {
      el.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        el.remove();
        this.notifications = this.notifications.filter(id => id !== notifId);
      }, 300);
    }
  }

  _getColor(type) {
    const colors = {
      'success': '#4CAF50',
      'error': '#f44336',
      'info': '#2196F3',
      'warning': '#ff9800'
    };
    return colors[type] || colors['info'];
  }
}
```

### Usar NotificationCenter

```javascript
const notifier = new NotificationCenter();
notifier.init();

notifier.show('Tarefa atualizada com sucesso!', 'success', [
  {
    label: 'Desfazer',
    callback: () => app.reload()
  }
]);
```

---

## 5️⃣ Adicionar Exportação em CSV

```javascript
// src/js/ExportManager.js

class ExportManager {
  /**
   * Exporta tarefas para CSV
   */
  static exportToCSV(tasks, filename = 'cronograma.csv') {
    const headers = ['ID', 'Tarefa', 'Início', 'Fim', 'Status', 'Progresso', 'Responsável'];
    
    const rows = tasks.map(t => [
      t.id,
      t.name,
      t.start,
      t.end,
      t.status,
      t.progress,
      t.responsible
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Exporta para JSON
   */
  static exportToJSON(data, filename = 'cronograma.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

// Usar:
ExportManager.exportToCSV(dataLoader.getTasks());
ExportManager.exportToJSON(dataLoader.data);
```

---

## 6️⃣ Integração com API Backend

```javascript
// src/js/DataLoaderAPI.js

class DataLoaderAPI extends DataLoader {
  constructor(apiUrl) {
    super();
    this.apiUrl = apiUrl;
  }

  async load() {
    try {
      const response = await fetch(`${this.apiUrl}/tasks`);
      if (!response.ok) throw new Error('Erro ao carregar dados da API');
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }

  async createTask(task) {
    const response = await fetch(`${this.apiUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return response.json();
  }

  async updateTask(id, task) {
    const response = await fetch(`${this.apiUrl}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    return response.json();
  }

  async deleteTask(id) {
    return await fetch(`${this.apiUrl}/tasks/${id}`, {
      method: 'DELETE'
    });
  }
}

// Usar:
const apiLoader = new DataLoaderAPI('https://api.exemplo.com');
await apiLoader.load();
```

---

## 7️⃣ Validação de Dados

```javascript
// src/js/Validator.js

class Validator {
  static validateTask(task) {
    const errors = [];

    if (!task.name || task.name.trim() === '') {
      errors.push('Nome da tarefa é obrigatório');
    }

    if (!task.start || !this._isValidDate(task.start)) {
      errors.push('Data de início inválida');
    }

    if (!task.end || !this._isValidDate(task.end)) {
      errors.push('Data de fim inválida');
    }

    if (new Date(task.start) > new Date(task.end)) {
      errors.push('Data de início não pode ser após a data de fim');
    }

    if (task.progress < 0 || task.progress > 100) {
      errors.push('Progresso deve estar entre 0 e 100');
    }

    const validStatuses = ['completed', 'in-progress', 'not-started'];
    if (!validStatuses.includes(task.status)) {
      errors.push(`Status deve ser um dos: ${validStatuses.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static _isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
}

// Usar:
const validation = Validator.validateTask(task);
if (!validation.valid) {
  console.error(validation.errors);
}
```

---

## 📝 Checklist de Extensão

- [ ] Criar novo módulo com classe clara
- [ ] Adicionar documentação JSDoc
- [ ] Testar isoladamente
- [ ] Integrar no `App.js` ou componente existente
- [ ] Adicionar exemplo de uso
- [ ] Atualizar documentação

---

**Precisa de outro exemplo?** Abra uma issue! 🎉
