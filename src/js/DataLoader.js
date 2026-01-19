/**
 * DataLoader - Carrega e processa dados do cronograma
 * Responsabilidade: Comunicação com dados e transformação deles
 */
class DataLoader {
  constructor(dataPath = null, notionConfig = {token: null, databaseId: null}) {
    this.dataPath = dataPath;
    this.notionConfig = notionConfig; // { token, databaseId }
    this.data = null;
  }

  /**
   * Carrega os dados do cronograma
   * Tenta por ordem: CSV JSON normalizado, JSON normalizado, Notion
   */
  async load() {
    // Tenta carregar de CSV JSON normalizado com DataNormalizer
    if (this.notionConfig?.csvJsonPath) {
      try {
        return await this.loadFromCSVJSON(this.notionConfig.csvJsonPath);
      } catch (error) {
        console.warn('Erro ao carregar CSV JSON:', error);
      }
    }

    // Fallback: tenta carregar de JSON normalizado (cronograma.json)
    if (this.dataPath) {
      try {
        return await this.loadFromJSON();
      } catch (error) {
        console.warn('Erro ao carregar JSON direto:', error);
      }
    }

    // Por último, tenta Notion
    if (this.notionConfig?.token && this.notionConfig?.databaseId) {
      try {
        return await this.loadFromNotion();
      } catch (error) {
        console.error('Erro ao carregar dados do Notion:', error);
        throw error;
      }
    }

    throw new Error('Configure csvJsonPath, dataPath ou notionConfig para carregar dados');
  }

  /**
   * Carrega dados do arquivo JSON local
   */
  async loadFromJSON() {
    try {
      const response = await fetch(this.dataPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Erro ao carregar dados do JSON:', error);
      throw error;
    }
  }

  /**
   * Carrega dados da API do Notion
   */
  async loadFromNotion() {
    try {
      const { token, databaseId } = this.notionConfig;
      
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page_size: 100
        })
      });

      if (!response.ok) {
        throw new Error(`Notion API error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformar dados do Notion para o formato esperado
      this.data = this._transformNotionData(result.results);
      console.log('Dados carregados do Notion:', this.data);
      return this.data;
    } catch (error) {
      console.error('Erro ao carregar dados do Notion:', error);
      throw error;
    }
  }

  /**
   * Carrega e normaliza dados do CSV JSON usando DataNormalizer
   */
  async loadFromCSVJSON(csvJsonPath) {
    try {
      const response = await fetch(csvJsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.json();
      
      // Usa DataNormalizer para normalizar os dados
      if (typeof DataNormalizer === 'undefined') {
        throw new Error('DataNormalizer não está carregado. Adicione <script src="src/js/DataNormalizer.js"></script> ao HTML');
      }
      
      this.data = DataNormalizer.normalize(csvData);
      console.log('Dados carregados e normalizados do CSV JSON:', this.data);
      return this.data;
    } catch (error) {
      console.error('Erro ao carregar dados do CSV JSON:', error);
      throw error;
    }
  }

  /**
   * Transforma dados do Notion para o formato esperado
   */
  _transformNotionData(results) {
    const tasks = results.map((page, index) => {
      const props = page.properties;
      
      return {
        id: index + 1,
        name: this._getPropertyValue(props, 'Nome') || this._getPropertyValue(props, 'name') || 'Sem nome',
        phase: this._getPropertyValue(props, 'Etapa') || this._getPropertyValue(props, 'phase') || 'Planejamento',
        project: this._getPropertyValue(props, 'Projeto') || this._getPropertyValue(props, 'project') || 'Meu Projeto',
        start: this._getDateValue(props, 'Data Início') || this._getDateValue(props, 'start') || new Date().toISOString().split('T')[0],
        end: this._getDateValue(props, 'Data Fim') || this._getDateValue(props, 'end') || new Date().toISOString().split('T')[0],
        status: this._getPropertyValue(props, 'Status') || this._getPropertyValue(props, 'status') || 'not-started',
        progress: this._getPropertyValue(props, 'Progresso') || this._getPropertyValue(props, 'progress') || 0,
        responsible: this._getPropertyValue(props, 'Responsável') || this._getPropertyValue(props, 'responsible') || 'Não atribuído'
      };
    });

    return {
      project: {
        name: 'FF Executive Project',
        description: 'Cronograma do Projeto FF Executive',
        startDate: new Date().toISOString().split('T')[0]
      },
      tasks: tasks
    };
  }

  /**
   * Extrai valor de propriedade do Notion (suporta múltiplos tipos)
   */
  _getPropertyValue(properties, fieldName) {
    const prop = properties[fieldName];
    if (!prop) return null;

    switch (prop.type) {
      case 'title':
        return prop.title?.[0]?.plain_text || null;
      case 'rich_text':
        return prop.rich_text?.[0]?.plain_text || null;
      case 'select':
        return prop.select?.name || null;
      case 'number':
        return prop.number;
      case 'status':
        return prop.status?.name || null;
      default:
        return null;
    }
  }

  /**
   * Extrai data do Notion
   */
  _getDateValue(properties, fieldName) {
    const prop = properties[fieldName];
    if (!prop || prop.type !== 'date') return null;
    return prop.date?.start || null;
  }

  /**
   * Retorna o projeto
   */
  getProject() {
    return this.data?.project || null;
  }

  /**
   * Retorna todas as tarefas
   */
  getTasks() {
    return this.data?.tasks || [];
  }

  /**
   * Retorna uma tarefa por ID
   */
  getTaskById(id) {
    return this.getTasks().find(task => task.id === id);
  }

  /**
   * Retorna tarefas filtradas por status
   */
  getTasksByStatus(status) {
    return this.getTasks().filter(task => task.status === status);
  }

  /**
   * Transforma dados para formato esperado pelo Plotly
   */
  transformForPlotly() {
    const tasks = this.getTasks();
    
    return tasks.map(task => ({
      Task: task.name,
      Start: new Date(task.start),
      End: new Date(task.end),
      Progress: task.progress,
      Status: task.status,
      Responsible: task.responsible,
      Project: task.project || 'Meu Projeto',
      Phase: task.phase || task.name
    }));
  }
}

// Exporta para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
