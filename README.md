# Visualização de Portfólio Estratégico

## 🎯 Features

- 📊 Gráfico Gantt interativo com Plotly.js
- 🎨 Interface responsiva e moderna
- 📱 Compatível com mobile e desktop
- 🔄 Filtro por status de tarefas
- 📥 Exportar gráfico como imagem
- 📈 Estatísticas em tempo real
- 🏗️ Arquitetura modular e escalável
- ⚡ Performance otimizada

## 🚀 Quick Start

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/ff-executive-project.git
cd ff-executive-project
```

### 2. Abrir no Navegador
```bash
# Opção 1: Abrir direto
open index.html

# Opção 2: Usar um servidor HTTP (recomendado)
python -m http.server 8000
# Depois acessa http://localhost:8000
```

### 3. Customizar Dados
Edite `src/data/cronograma.json` com suas tarefas:

```json
{
  "project": {
    "name": "Seu Projeto",
    "description": "Descrição",
    "startDate": "2024-01-01"
  },
  "tasks": [
    {
      "id": 1,
      "name": "Sua Tarefa",
      "start": "2024-01-01",
      "end": "2024-01-15",
      "status": "completed",
      "progress": 100,
      "responsible": "Seu Nome"
    }
  ]
}
```

## 📁 Estrutura do Projeto

```
ff-executive-project/
├── index.html                 # Página principal
├── README.md                  # Este arquivo
├── src/
│   ├── js/                   # Módulos JavaScript
│   │   ├── App.js            # Orquestrador principal
│   │   ├── DataLoader.js     # Carregamento de dados
│   │   ├── ChartBuilder.js   # Gráficos
│   │   └── UIManager.js      # Interface e eventos
│   ├── css/
│   │   └── styles.css        # Estilos modulares
│   └── data/
│       └── cronograma.json   # Dados do projeto
└── docs/
    └── ARCHITECTURE.md       # Documentação arquitetura
```

## 🏗️ Arquitetura

O projeto segue as **melhores práticas de arquitetura**:

- **Separação de Responsabilidades** - Cada módulo tem uma função clara
- **Padrão Facade** - Interface simples para componentes complexos
- **Modularidade** - Componentes reutilizáveis e testáveis
- **SOLID Principles** - Código limpo e escalável

📖 Veja [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalhes completos.

## 🔄 Fluxo de Funcionamento

```
index.html
    ↓
App.init()
    ├─→ DataLoader → carrega cronograma.json
    ├─→ ChartBuilder → renderiza gráfico Gantt
    └─→ UIManager → cria controles e eventos
```

## 🎨 Customização

### Mudar Cores de Status

```javascript
const chart = new ChartBuilder();
chart.setStatusColors({
  'completed': '#00FF00',
  'in-progress': '#0000FF',
  'not-started': '#CCCCCC'
});
```

### Adicionar Novo Campo em Tarefa

```json
{
  "id": 1,
  "name": "Tarefa",
  "priority": "high",      // ← Novo campo
  "category": "Backend"    // ← Novo campo
}
```

## 🔧 Desenvolvimento

### Adicionar Nova Feature

1. Criar novo módulo em `src/js/`
2. Exportar a classe
3. Integrar no `App.js`

### Debug

```javascript
// Após inicialização, acesse:
window.app.getState()           // Estado da aplicação
window.app.reload()             // Recarregar dados
```

## 📦 Dependências

- [Plotly.js](https://plotly.com/javascript/) - Visualização de dados

## 📝 Status de Tarefas

- 🟢 **Completada** (completed)
- 🔵 **Em Progresso** (in-progress)
- ⚪ **Não Iniciada** (not-started)

## 🚀 Deploy

### GitHub Pages

```bash
# Commit e push para main branch
git add .
git commit -m "Update project"
git push origin main

# Ativar GitHub Pages em Settings
```

### Outros Hosts

- Netlify: Drag & drop a pasta
- Vercel: Importar repositório Git
- Firebase: `firebase deploy`

## 🐛 Troubleshooting

**Erro: "CORS policy: Cross origin requests are blocked"**
- Use um servidor HTTP (não abra arquivo direto)
- Python: `python -m http.server 8000`
- Node: `npx http-server`

**Gráfico não aparece**
- Verifique caminho em `App.js`: `dataPath: './src/data/cronograma.json'`
- Cheque se `cronograma.json` está estruturado corretamente

**Estilos não carregam**
- Verifique caminhos em `index.html`
- Limpe cache do navegador (Ctrl+Shift+Delete)

## 📞 Suporte

- Abra uma [Issue](https://github.com/seu-usuario/ff-executive-project/issues)
- Envie um [Pull Request](https://github.com/seu-usuario/ff-executive-project/pulls)

## 📄 Licença

MIT - 

---

**Última Atualização**: Janeiro 2025  
**Versão**: 1.0