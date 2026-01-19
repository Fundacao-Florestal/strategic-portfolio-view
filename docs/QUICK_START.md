# 📋 Guia Rápido - FF Executive Project

## ⚡ Setup em 2 Minutos

### 1️⃣ Servidor Local
```bash
cd strategic-portfolio-view
python -m http.server 8000
```
Acesse: `http://localhost:8000`

### 2️⃣ Editar Cronograma
Edite `src/data/cronograma.json`

### 3️⃣ Pronto! 🎉
O gráfico atualiza automaticamente

---

## 📂 Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `index.html` | Página inicial |
| `src/data/cronograma.json` | Dados do projeto |
| `src/js/App.js` | Orquestrador |
| `src/js/DataLoader.js` | Carrega dados |
| `src/js/ChartBuilder.js` | Cria gráficos |
| `src/js/UIManager.js` | Interface |
| `src/css/styles.css` | Estilos |

---

## 🔧 Customizações Comuns

### Adicionar Tarefa
```json
{
  "id": 7,
  "name": "Nova Tarefa",
  "start": "2024-06-01",
  "end": "2024-06-15",
  "status": "not-started",
  "progress": 0,
  "responsible": "Seu Nome"
}
```

### Mudar Cores
Em `ChartBuilder.js`, linha ~28:
```javascript
this.statusColors = {
  'completed': '#4CAF50',      // Mude aqui
  'in-progress': '#2196F3',
  'not-started': '#9E9E9E'
};
```

### Alterar Título
Em `index.html`, linha ~17:
```html
<h1>📊 Seu Título Aqui</h1>
```

---

## 💻 Console / Debug

```javascript
// No console do navegador (F12):
app.getState()              // Ver estado
app.reload()                // Recarregar dados
window.dataLoader           // Acessar dados
```

---

## 🎯 Estrutura de Tarefa

```json
{
  "id": 1,                    // Identificador único
  "name": "Nome da Tarefa",   // Nome exibido
  "start": "YYYY-MM-DD",      // Data de início
  "end": "YYYY-MM-DD",        // Data de fim
  "status": "completed",      // completed | in-progress | not-started
  "progress": 100,            // Percentual 0-100
  "responsible": "Nome"       // Responsável
}
```

---

## 🚀 Deploy Rápido

**GitHub Pages:**
```bash
git push origin main
```
Ativar em Settings → Pages

**Netlify:**
Drag & drop a pasta do projeto

---

## ❓ FAQ

**P: Como carregar dados de uma API?**  
R: Edite `DataLoader.js`, método `load()`:
```javascript
const response = await fetch('https://api.exemplo.com/tasks');
```

**P: Como adicionar mais informações na tarefa?**  
R: Adicione campos em `cronograma.json` e use em `ChartBuilder.js`

**P: Como mudar o idioma?**  
R: Edite os textos em `UIManager.js` e `index.html`

---

## 🔗 Links Úteis

- [Documentação Completa](docs/ARCHITECTURE.md)
- [Plotly.js Docs](https://plotly.com/javascript/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Precisa de mais ajuda?** Veja `docs/ARCHITECTURE.md` 📖
