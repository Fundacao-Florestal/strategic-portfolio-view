/**
 * UIManager - Gerencia eventos e interações da interface
 * Responsabilidade: Lógica de interface e eventos de usuário
 */
class UIManager {
  constructor(config = {}) {
    this.config = {
      chartContainer: 'chart-container',
      controlsContainer: 'controls',
      exportBtn: 'export-btn',
      filterBtn: 'filter-btn',
      ...config
    };
    this.chartBuilder = null;
    this.dataLoader = null;
    this.currentFilter = null;
  }

  /**
   * Inicializa o gerenciador da UI
   */
  init(chartBuilder, dataLoader) {
    this.chartBuilder = chartBuilder;
    this.dataLoader = dataLoader;
    this.setupEventListeners();
    this.createControls();
  }

  /**
   * Cria controles na interface
   */
  createControls() {
    const controlsContainer = document.getElementById(this.config.controlsContainer);
    
    if (!controlsContainer) {
      console.warn('Elemento de controles não encontrado');
      return;
    }

    // Botão de exportação
    const exportBtn = document.createElement('button');
    exportBtn.id = this.config.exportBtn;
    exportBtn.className = 'btn btn-primary';
    exportBtn.textContent = '📥 Exportar Gráfico';
    exportBtn.addEventListener('click', () => this.handleExport());

    // Filtro de status
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-group';
    
    const filterLabel = document.createElement('label');
    filterLabel.textContent = 'Filtrar por Status:';
    
    const filterSelect = document.createElement('select');
    filterSelect.className = 'filter-select';
    filterSelect.innerHTML = `
      <option value="">Todos</option>
      <option value="completed">✓ Completado</option>
      <option value="in-progress">→ Em Progresso</option>
      <option value="not-started">○ Não Iniciado</option>
    `;
    filterSelect.addEventListener('change', (e) => this.handleFilter(e.target.value));

    // filterContainer.appendChild(filterLabel);
    // filterContainer.appendChild(filterSelect);

    controlsContainer.appendChild(exportBtn);
    // controlsContainer.appendChild(filterContainer);
  }

  /**
   * Configura listeners de eventos
   */
  setupEventListeners() {
    // Responsivo em redimensionamento
    window.addEventListener('resize', () => {
      if (this.chartBuilder && this.chartBuilder.chart) {
        Plotly.Plots.resize(this.config.chartContainer);
      }
    });
  }

  /**
   * Manipulador para exportação
   */
  handleExport() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      this.chartBuilder.exportAsImage(`cronograma-${timestamp}.png`);
      this.showNotification('Gráfico exportado com sucesso!', 'success');
    } catch (error) {
      this.showNotification('Erro ao exportar gráfico', 'error');
      console.error(error);
    }
  }

  /**
   * Manipulador para filtro
   */
  handleFilter(status) {
    this.currentFilter = status || null;
    const data = status 
      ? this.dataLoader.getTasksByStatus(status).map(task => ({
          Task: task.name,
          Start: new Date(task.start),
          End: new Date(task.end),
          Progress: task.progress,
          Status: task.status,
          Responsible: task.responsible
        }))
      : this.dataLoader.transformForPlotly();
    
    this.chartBuilder.updateChart(data);
    this.showNotification(`Filtro aplicado: ${status || 'Todos'}`, 'info');
  }

  /**
   * Mostra notificações ao usuário
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Atualiza estatísticas do projeto
   */
  updateStats() {
    const tasks = this.dataLoader.getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Conta projetos únicos
    const uniqueProjects = [...new Set(tasks.map(t => t.project))];
    const totalProjects = uniqueProjects.length;
    
    // Conta tarefas por fase que estão acontecendo HOJE (start <= hoje <= end)
    const planejamentoCount = tasks.filter(t => {
      const start = new Date(t.start);
      const end = new Date(t.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return t.phase === 'Planejamento' && start <= today && today <= end;
    }).length;
    
    const contratacaoCount = tasks.filter(t => {
      const start = new Date(t.start);
      const end = new Date(t.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return t.phase === 'Contratação' && start <= today && today <= end;
    }).length;
    
    const execucaoCount = tasks.filter(t => {
      const start = new Date(t.start);
      const end = new Date(t.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return t.phase === 'Execução' && start <= today && today <= end;
    }).length;

    const statsContainer = document.getElementById('stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="stat-card">
          <h3>Total de Projetos</h3>
          <p>${totalProjects}</p>
        </div>
        <div class="stat-card">
          <h3>Planejamento Hoje</h3>
          <p>${planejamentoCount}</p>
        </div>
        <div class="stat-card">
          <h3>Contratação Hoje</h3>
          <p>${contratacaoCount}</p>
        </div>
        <div class="stat-card">
          <h3>Execução Hoje</h3>
          <p>${execucaoCount}</p>
        </div>
      `;
    }
  }
}

// Exporta para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
