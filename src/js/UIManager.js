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

    console.log('Criando controles...', this.dataLoader);

    // Botão de exportação
    const exportBtn = document.createElement('button');
    exportBtn.id = this.config.exportBtn;
    exportBtn.className = 'btn btn-primary';
    exportBtn.textContent = '📥 Exportar Gráfico';
    exportBtn.addEventListener('click', () => this.handleExport());

    // Filtro de Diretoria
    const diretoriaFilterContainer = document.createElement('div');
    diretoriaFilterContainer.className = 'filter-group';
    
    const diretoriaLabel = document.createElement('label');
    diretoriaLabel.textContent = 'Filtrar por Diretoria:';
    
    const diretoriaSelect = document.createElement('select');
    diretoriaSelect.id = 'filter-diretoria';
    diretoriaSelect.className = 'filter-select';
    diretoriaSelect.innerHTML = '<option value="">Todas as Diretorias</option>';
    
    // Popula opções de diretoria
    try {
      const diretorias = this.dataLoader.getDiretorias();
      console.log('Diretorias carregadas:', diretorias);
      diretorias.forEach(diretoria => {
        const option = document.createElement('option');
        option.value = diretoria;
        option.textContent = diretoria;
        diretoriaSelect.appendChild(option);
      });
    } catch (e) {
      console.error('Erro ao carregar diretorias:', e);
    }
    
    diretoriaSelect.addEventListener('change', () => this.applyFilters());

    diretoriaFilterContainer.appendChild(diretoriaLabel);
    diretoriaFilterContainer.appendChild(diretoriaSelect);

    // Filtro de Assessoria/Núcleo/Programas
    const assessoriaFilterContainer = document.createElement('div');
    assessoriaFilterContainer.className = 'filter-group';
    
    const assessoriaLabel = document.createElement('label');
    assessoriaLabel.textContent = 'Filtrar por Assessoria | Núcleo | Programas:';
    
    const assessoriaSelect = document.createElement('select');
    assessoriaSelect.id = 'filter-assessoria';
    assessoriaSelect.className = 'filter-select';
    assessoriaSelect.innerHTML = '<option value="">Todas</option>';
    
    // Popula opções de assessoria
    try {
      const assessorias = this.dataLoader.getAssessoriaOuNucleo();
      console.log('Assessorias carregadas:', assessorias);
      assessorias.forEach(assessoria => {
        const option = document.createElement('option');
        option.value = assessoria;
        option.textContent = assessoria;
        assessoriaSelect.appendChild(option);
      });
    } catch (e) {
      console.error('Erro ao carregar assessorias:', e);
    }
    
    assessoriaSelect.addEventListener('change', () => this.applyFilters());

    assessoriaFilterContainer.appendChild(assessoriaLabel);
    assessoriaFilterContainer.appendChild(assessoriaSelect);

    controlsContainer.appendChild(exportBtn);
    controlsContainer.appendChild(diretoriaFilterContainer);
    controlsContainer.appendChild(assessoriaFilterContainer);
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
   * Aplica filtros de Diretoria e Assessoria
   */
  applyFilters() {
    console.log('Aplicando filtros...');
    
    const diretoriaSelect = document.getElementById('filter-diretoria');
    const assessoriaSelect = document.getElementById('filter-assessoria');
    
    const diretoria = diretoriaSelect?.value || '';
    const assessoria = assessoriaSelect?.value || '';

    console.log('Filtros selecionados:', { diretoria, assessoria });

    // Se não há filtros, recarrega todos os dados
    if (!diretoria && !assessoria) {
      const allData = this.dataLoader.transformForPlotly();
      this.chartBuilder.updateChart(allData);
      this.updateStats(); // Atualiza stats com todos os dados
      this.showNotification('Filtro removido: Mostrando todos os projetos', 'info');
      return;
    }

    // Filtra os dados brutos
    const filteredRawData = this.dataLoader.filterByDiretoriaAndAssessoria(diretoria, assessoria);
    console.log('Dados brutos filtrados:', filteredRawData.length, 'projetos');

    // Normaliza os dados filtrados usando DataNormalizer
    const normalizedData = DataNormalizer.normalize(filteredRawData);
    console.log('Dados normalizados:', normalizedData);

    // Transforma para Plotly
    const plotlyData = normalizedData.tasks.map(task => ({
      Task: task.name,
      Start: new Date(task.start),
      End: new Date(task.end),
      Progress: task.progress,
      Status: task.status,
      Responsible: task.responsible,
      Project: task.project,
      Phase: task.phase
    }));

    console.log('Dados transformados para Plotly:', plotlyData.length, 'tarefas');

    this.chartBuilder.updateChart(plotlyData);
    this.updateStats(normalizedData.tasks); // Atualiza stats com dados filtrados
    
    const filterText = [diretoria, assessoria].filter(Boolean).join(' + ') || 'Todos';
    this.showNotification(`Filtro aplicado: ${filterText} (${filteredRawData.length} projetos)`, 'info');
  }  /**
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
   * @param {Array} tasksToUse - Opcional: array de tasks filtradas. Se não fornecido, usa todas as tasks.
   */
  updateStats(tasksToUse = null) {
    const tasks = tasksToUse || this.dataLoader.getTasks();
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
