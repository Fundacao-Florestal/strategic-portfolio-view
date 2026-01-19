# Arquitetura do Projeto FF Executive

## 📋 Visão Geral

Este projeto segue as **melhores práticas de arquitetura** com separação de responsabilidades, padrões de design e modularidade.

## 🏗️ Estrutura de Diretórios

```
strategic-portfolio-view/
├── index.html                 # Ponto de entrada principal
├── README.md                  # Documentação geral
├── src/
│   ├── js/                   # Lógica da aplicação
│   │   ├── App.js            # Orquestrador principal (Facade Pattern)
│   │   ├── DataLoader.js     # Carregamento e transformação de dados
│   │   ├── ChartBuilder.js   # Construção e renderização de gráficos
│   │   └── UIManager.js      # Gerenciamento de interface e eventos
│   ├── css/
│   │   └── styles.css        # Estilos modulares (CSS Variables)
│   └── data/
│       └── cronograma.json   # Dados do projeto (JSON estruturado)
├── docs/
│   └── ARCHITECTURE.md       # Este arquivo
└── cronograma_projeto.html   # Versão anterior (mantida para referência)
```

## 🎯 Padrões de Design Utilizados

### 1. **Facade Pattern** (App.js)
- Fornece uma interface simples para componentes complexos
- Orquestra DataLoader, ChartBuilder e UIManager
- Gerencia o ciclo de vida da aplicação

### 2. **Separation of Concerns (SoC)**
- **DataLoader**: Responsável apenas por carregar e transformar dados
- **ChartBuilder**: Responsável apenas pela visualização
- **UIManager**: Responsável apenas pelas interações do usuário
- **App**: Orquestrador que coordena todos

### 3. **Module Pattern**
- Cada classe é auto-contida e pode ser testada isoladamente
- Encapsulamento de dados e métodos privados (prefixo `_`)
- Exportação compatível com CommonJS e ES6

### 4. **Observer Pattern** (Eventos Customizados)
- Uso de CustomEvent para comunicação entre componentes
- Eventos: `app:initialized`, `app:reloaded`

## 📦 Componentes

### **App.js** - Orquestrador Principal
```javascript
const app = new App(config);
await app.init();
```
- Inicializa todos os componentes
- Carrega dados
- Constrói a interface
- Gerencia o estado global

**Responsabilidades:**
- Coordenação entre módulos
- Gerenciamento do ciclo de vida
- Tratamento de erros global

---

### **DataLoader.js** - Gerenciador de Dados
```javascript
const loader = new DataLoader('./src/data/cronograma.json');
await loader.load();
const tasks = loader.getTasks();
```

**Responsabilidades:**
- Carregar dados JSON
- Transformar dados para formato Plotly
- Filtrar dados por status
- Cache de dados

**Métodos Principais:**
- `load()` - Carrega os dados
- `getTasks()` - Retorna todas as tarefas
- `getTaskById(id)` - Retorna tarefa específica
- `getTasksByStatus(status)` - Filtra por status
- `transformForPlotly()` - Transforma dados para o formato do Plotly

---

### **ChartBuilder.js** - Construtor de Gráficos
```javascript
const chart = new ChartBuilder('chart-container');
chart.buildGanttChart(data);
```

**Responsabilidades:**
- Criar gráficos Gantt
- Configurar layout e estilos
- Gerenciar cores e cores de status
- Exportar gráficos como imagens

**Métodos Principais:**
- `buildGanttChart(data)` - Cria novo gráfico
- `updateChart(data)` - Atualiza gráfico existente
- `setStatusColors(colors)` - Define cores customizadas
- `exportAsImage(filename)` - Exporta como PNG

---

### **UIManager.js** - Gerenciador de Interface
```javascript
const ui = new UIManager(config);
ui.init(chartBuilder, dataLoader);
```

**Responsabilidades:**
- Criar controles interativos
- Gerenciar eventos do usuário
- Mostrar notificações
- Atualizar estatísticas

**Métodos Principais:**
- `init(chartBuilder, dataLoader)` - Inicializa UI
- `handleExport()` - Exporta gráfico
- `handleFilter(status)` - Filtra tarefas
- `updateStats()` - Atualiza estatísticas
- `showNotification(message, type)` - Mostra notificação

---

## 📊 Fluxo de Dados

```
index.html (inicialização)
    ↓
App.init()
    ├─→ DataLoader.load() → Carrega cronograma.json
    ├─→ ChartBuilder.buildGanttChart() → Renderiza gráfico
    └─→ UIManager.init() → Cria controles e listeners
        ├─→ updateStats()
        └─→ setupEventListeners()
```

## 🔄 Fluxo de Interação do Usuário

```
Usuário clica em filtro
    ↓
UIManager.handleFilter()
    ↓
DataLoader.getTasksByStatus()
    ↓
ChartBuilder.updateChart()
    ↓
Gráfico atualizado na tela
```

## 🎨 Estrutura de Dados

### cronograma.json
```json
{
  "project": {
    "name": "FF Executive Project",
    "description": "...",
    "startDate": "2024-01-01"
  },
  "tasks": [
    {
      "id": 1,
      "name": "Nome da Tarefa",
      "start": "2024-01-01",
      "end": "2024-01-15",
      "status": "completed|in-progress|not-started",
      "progress": 100,
      "responsible": "Nome do Responsável"
    }
  ]
}
```

## 🎯 Status de Tarefa

- **completed** 🟢 (#4CAF50) - Tarefa finalizada
- **in-progress** 🔵 (#2196F3) - Tarefa em andamento
- **not-started** ⚪ (#9E9E9E) - Tarefa não iniciada

## 🎨 Paleta de Cores (CSS Variables)

```css
--primary-color: #2196F3      /* Azul principal */
--success-color: #4CAF50      /* Verde - sucesso */
--error-color: #f44336        /* Vermelho - erro */
--warning-color: #ff9800      /* Laranja - aviso */
--dark-gray: #333333          /* Texto principal */
--light-gray: #f5f5f5         /* Fundo */
```

## 🚀 Como Usar

### 1. Inicialização Automática
```html
<script src="src/js/App.js"></script>
<script>
  const app = new App();
  await app.init();
</script>
```

### 2. Acesso Global
```javascript
// Após inicialização, `app` fica disponível globalmente
window.app.reload();
console.log(window.app.getState());
```

### 3. Integração com Eventos
```javascript
document.addEventListener('app:initialized', (e) => {
  console.log('App inicializado!', e.detail);
});

document.addEventListener('app:reloaded', (e) => {
  console.log('Dados recarregados!', e.detail);
});
```

## ✅ Melhores Práticas Implementadas

- ✅ **Separação de Responsabilidades** - Cada classe tem uma função clara
- ✅ **Modularidade** - Componentes independentes e reutilizáveis
- ✅ **DRY (Don't Repeat Yourself)** - Código sem duplicação
- ✅ **SOLID Principles**:
  - Single Responsibility: Cada classe tem uma responsabilidade
  - Open/Closed: Aberto para extensão, fechado para modificação
  - Dependency Injection: Dependências injetadas via constructor
- ✅ **Documentação** - JSDoc comments em funções públicas
- ✅ **Error Handling** - Tratamento de erros em múltiplos níveis
- ✅ **Responsive Design** - Interface adaptativa para mobile
- ✅ **CSS Modular** - Variables, flexbox, grid layout
- ✅ **Código Limpo** - Naming consistente, formatação clara

## 🔧 Extensão e Customização

### Adicionar Novo Status de Tarefa

```javascript
// Em DataLoader.js - não precisa mudar
// Em ChartBuilder.js - adicionar cor
const statusColors = {
  'completed': '#4CAF50',
  'in-progress': '#2196F3',
  'not-started': '#9E9E9E',
  'blocked': '#FF5722'  // ← Novo status
};
```

### Customizar Cores

```javascript
const chart = new ChartBuilder();
chart.setStatusColors({
  'completed': '#00AA00',
  'in-progress': '#0000FF'
});
```

### Adicionar Novo Campo em Tarefa

```json
{
  "id": 1,
  "name": "...",
  "category": "Development",  // ← Novo campo
  "priority": "high"          // ← Novo campo
}
```

## 📈 Performance

- **Lazy Loading**: Dados carregados sob demanda
- **Debouncing**: Resize events otimizados
- **Efficient DOM**: Minimal DOM manipulation
- **CSS Optimization**: Variables para reutilização

## 🧪 Testabilidade

Cada classe pode ser testada isoladamente:

```javascript
// Teste de DataLoader
const loader = new DataLoader(mockPath);
await loader.load();
assert(loader.getTasks().length > 0);

// Teste de ChartBuilder
const chart = new ChartBuilder('test-container');
chart.buildGanttChart(mockData);
assert(document.getElementById('test-container').innerHTML !== '');
```

## 📝 Próximas Melhorias

- [ ] Adicionar testes unitários (Jest/Mocha)
- [ ] Implementar build process (Webpack/Parcel)
- [ ] Adicionar TypeScript para type safety
- [ ] Backend API para persistência
- [ ] Autenticação de usuários
- [ ] Histórico de alterações (versioning)
- [ ] Integração com Git/GitHub
- [ ] CI/CD Pipeline

## 📚 Referências

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Clean Code](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Plotly.js Documentation](https://plotly.com/javascript/)

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025  
**Autor**: FF Executive Team
