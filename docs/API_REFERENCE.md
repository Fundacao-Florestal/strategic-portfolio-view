# 📖 Referência Rápida - API da Aplicação

## 🚀 Inicialização

```javascript
// Criar aplicação
const app = new App({
  dataPath: './src/data/cronograma.json',
  chartContainer: 'chart-container'
});

// Inicializar
await app.init();

// Resultado: aplicação pronta com gráfico renderizado
```

## 📚 API Pública

### App

```javascript
// Inicializar
await app.init()                    // Carrega e renderiza tudo

// Gerenciamento
await app.reload()                  // Recarrega dados
app.getState()                       // Retorna estado atual

// Exemplo de estado:
{
  initialized: true,
  project: { name: "...", ... },
  tasksCount: 6,
  filter: null
}
```

### DataLoader

```javascript
const loader = new DataLoader('./src/data/cronograma.json');

// Operações
await loader.load()                 // Carrega dados
loader.getTasks()                   // Array de tarefas
loader.getProject()                 // Info do projeto
loader.getTaskById(1)               // Tarefa por ID
loader.getTasksByStatus('completed') // Filtra por status
loader.transformForPlotly()         // Formata para Plotly

// Exemplo:
const tasks = loader.getTasks();
tasks.forEach(t => console.log(t.name, t.progress));
```

### ChartBuilder

```javascript
const chart = new ChartBuilder('chart-container');

// Criar/Atualizar
chart.buildGanttChart(data)         // Cria novo gráfico
chart.updateChart(data)             // Atualiza existente

// Customização
chart.setStatusColors({
  'completed': '#00FF00',
  'in-progress': '#0000FF'
});

// Exportar
chart.exportAsImage('cronograma.png')
```

### UIManager

```javascript
const ui = new UIManager();

// Inicializar
ui.init(chartBuilder, dataLoader)

// Interações
ui.handleFilter('in-progress')      // Aplica filtro
ui.handleExport()                   // Exporta gráfico
ui.updateStats()                    // Atualiza estatísticas
ui.showNotification(msg, type)      // Mostra notificação

// Tipos de notificação: 'success', 'error', 'info', 'warning'
```

## 🎯 Exemplos Práticos

### Exemplo 1: Exibir Estatísticas

```javascript
const tasks = app.dataLoader.getTasks();
const completed = tasks.filter(t => t.status === 'completed').length;
const inProgress = tasks.filter(t => t.status === 'in-progress').length;

console.log(`Total: ${tasks.length}`);
console.log(`Completadas: ${completed}`);
console.log(`Em Progresso: ${inProgress}`);
```

### Exemplo 2: Filtrar Tarefas

```javascript
// Tarefas com progresso > 50%
const advancedTasks = app.dataLoader.getTasks()
  .filter(t => t.progress > 50)
  .map(t => t.name);

// Atualizar gráfico
const filtered = app.dataLoader.getTasks()
  .filter(t => t.progress > 50)
  .map(task => ({
    Task: task.name,
    Start: new Date(task.start),
    End: new Date(task.end),
    Progress: task.progress,
    Status: task.status,
    Responsible: task.responsible
  }));

app.chartBuilder.updateChart(filtered);
```

### Exemplo 3: Notificações

```javascript
app.uiManager.showNotification('Dados carregados!', 'success');
app.uiManager.showNotification('Erro ao processar', 'error');
app.uiManager.showNotification('Informação importante', 'info');
app.uiManager.showNotification('Cuidado!', 'warning');
```

### Exemplo 4: Eventos Customizados

```javascript
// Escutar inicialização
document.addEventListener('app:initialized', (e) => {
  console.log('App inicializado!');
  console.log(e.detail);
});

// Escutar reload
document.addEventListener('app:reloaded', (e) => {
  console.log('Dados recarregados!');
  console.log(e.detail);
});
```

### Exemplo 5: Criar Nova Tarefa (simulado)

```javascript
const newTask = {
  id: 7,
  name: "Nova Funcionalidade",
  start: "2024-06-01",
  end: "2024-06-15",
  status: "not-started",
  progress: 0,
  responsible: "Dev Team"
};

// Adicionar manualmente ao cronograma.json
// Depois recarregar:
await app.reload();
app.uiManager.showNotification('Nova tarefa adicionada!', 'success');
```

## 🎨 CSS Classes Disponíveis

```html
<!-- Botões -->
<button class="btn btn-primary">Clique aqui</button>

<!-- Notificações -->
<div class="notification notification-success">Sucesso</div>
<div class="notification notification-error">Erro</div>
<div class="notification notification-info">Info</div>
<div class="notification notification-warning">Aviso</div>

<!-- Cartões de Estatísticas -->
<div class="stat-card">
  <h3>Título</h3>
  <p>Valor</p>
</div>

<!-- Gráfico -->
<div id="chart-container"></div>
```

## 📊 Estrutura do JSON

```json
{
  "project": {
    "name": "Nome do Projeto",
    "description": "Descrição",
    "startDate": "2024-01-01"
  },
  "tasks": [
    {
      "id": 1,
      "name": "Nome da Tarefa",
      "start": "2024-01-01",
      "end": "2024-01-15",
      "status": "completed",
      "progress": 100,
      "responsible": "Responsável"
    }
  ]
}
```

## 🔧 Variáveis CSS

```css
:root {
  --primary-color: #2196F3;
  --success-color: #4CAF50;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --info-color: #2196F3;
  --dark-gray: #333333;
  --light-gray: #f5f5f5;
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}
```

## 🐛 Debug

```javascript
// No console:

// Ver estado completo
console.log(window.app.getState());

// Ver todas as tarefas
console.log(window.app.dataLoader.getTasks());

// Ver projeto
console.log(window.app.dataLoader.getProject());

// Ver tarefas completadas
console.log(window.app.dataLoader.getTasksByStatus('completed'));

// Testar notificação
window.app.uiManager.showNotification('Teste!', 'info');

// Recarregar dados
await window.app.reload();
```

## ⚙️ Configuração

```javascript
// Ao criar App, passar config:
const app = new App({
  dataPath: './src/data/cronograma.json',
  chartContainer: 'chart-container'
});

// UIManager também aceita config:
const ui = new UIManager({
  chartContainer: 'chart-container',
  controlsContainer: 'controls',
  exportBtn: 'export-btn'
});
```

## 📱 Métodos do DataLoader

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| `load()` | - | Promise | Carrega dados do JSON |
| `getTasks()` | - | Array | Retorna todas as tarefas |
| `getProject()` | - | Object | Retorna info do projeto |
| `getTaskById(id)` | id: number | Object | Retorna tarefa específica |
| `getTasksByStatus(status)` | status: string | Array | Filtra por status |
| `transformForPlotly()` | - | Array | Formata para Plotly |

## 📈 Métodos do ChartBuilder

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| `buildGanttChart(data)` | data: Array | HTMLElement | Cria novo gráfico |
| `updateChart(data)` | data: Array | void | Atualiza gráfico |
| `setStatusColors(colors)` | colors: Object | void | Define cores |
| `exportAsImage(filename)` | filename: string | void | Exporta PNG |

## 🎯 Métodos do UIManager

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| `init(chartBuilder, dataLoader)` | - | void | Inicializa UI |
| `createControls()` | - | void | Cria controles |
| `handleFilter(status)` | status: string | void | Aplica filtro |
| `handleExport()` | - | void | Exporta gráfico |
| `updateStats()` | - | void | Atualiza stats |
| `showNotification(msg, type)` | msg: string, type: string | void | Mostra notificação |

## 🔄 Métodos do App

| Método | Parâmetros | Retorno | Descrição |
|--------|-----------|---------|-----------|
| `init()` | - | Promise<boolean> | Inicializa app |
| `reload()` | - | Promise<boolean> | Recarrega dados |
| `getState()` | - | Object | Retorna estado |

## 📝 Notas

- ✅ Todos os métodos são thread-safe
- ✅ Métodos async retornam Promise
- ✅ Métodos private começam com `_`
- ✅ Documentação completa com JSDoc
- ✅ Eventos customizados: `app:initialized`, `app:reloaded`

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025
