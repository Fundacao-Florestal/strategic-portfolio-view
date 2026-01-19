/**
 * App - Classe principal que orquestra toda a aplicação
 * Padrão: Facade Pattern - fornece interface simples para componentes complexos
 */
class App {
  constructor(config = {}) {
    this.config = {
      chartContainer: 'chart-container',
      dataPath: null,
      notionConfig: null, // { token, databaseId, csvJsonPath }
      ...config
    };
    
    this.dataLoader = null;
    this.chartBuilder = null;
    this.uiManager = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa a aplicação
   */
  async init() {
    try {
      console.log('Inicializando aplicação...');

      // Inicializa componentes
      this.dataLoader = new DataLoader(this.config.dataPath, this.config.notionConfig);
      this.chartBuilder = new ChartBuilder(this.config.chartContainer);
      this.uiManager = new UIManager({
        chartContainer: this.config.chartContainer
      });

      // Carrega dados
      await this.dataLoader.load();
      console.log('Dados carregados com sucesso');

      // Constrói gráfico
      const transformedData = this.dataLoader.transformForPlotly();
      console.log('Dados transformados:', transformedData);
      this.chartBuilder.buildGanttChart(transformedData);
      console.log('Gráfico criado com sucesso');

      // Inicializa UI
      this.uiManager.init(this.chartBuilder, this.dataLoader);
      this.uiManager.updateStats();
      console.log('Interface inicializada');

      this.isInitialized = true;
      this._dispatchEvent('initialized');

      return true;
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      this._handleError(error);
      return false;
    }
  }

  /**
   * Recarrega os dados e atualiza a interface
   */
  async reload() {
    try {
      console.log('Recarregando dados...');
      await this.dataLoader.load();
      const transformedData = this.dataLoader.transformForPlotly();
      this.chartBuilder.updateChart(transformedData);
      this.uiManager.updateStats();
      this._dispatchEvent('reloaded');
      return true;
    } catch (error) {
      console.error('Erro ao recarregar:', error);
      this._handleError(error);
      return false;
    }
  }

  /**
   * Retorna o estado atual da aplicação
   */
  getState() {
    return {
      initialized: this.isInitialized,
      project: this.dataLoader?.getProject(),
      tasksCount: this.dataLoader?.getTasks().length,
      filter: this.uiManager?.currentFilter
    };
  }

  /**
   * Manipula erros globais
   */
  _handleError(error) {
    console.error('Erro na aplicação:', error.message);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="error-message">
          <strong>Erro:</strong> ${error.message}
          <button onclick="location.reload()">Recarregar</button>
        </div>
      `;
    }
  }

  /**
   * Dispara eventos customizados
   */
  _dispatchEvent(eventName) {
    const event = new CustomEvent(`app:${eventName}`, {
      detail: this.getState()
    });
    document.dispatchEvent(event);
  }
}

// Exporta para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
