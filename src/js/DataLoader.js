/**
 * DataLoader - Carrega e processa dados do cronograma
 * Responsabilidade: Comunicação com dados e transformação deles
 */
class DataLoader {
  constructor(dataPath = null, notionConfig = {token: null, databaseId: null}) {
    this.dataPath = dataPath;
    this.notionConfig = notionConfig; // { token, databaseId }
    this.data = null;
    this.rawData = null; // Armazena dados brutos do CSV
    console.log('DataLoader inicializado com config:', notionConfig);
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
      console.log('Carregando CSV JSON de:', csvJsonPath);
      const response = await fetch(csvJsonPath);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvData = await response.json();
      
      console.log('Dados CSV carregados:', csvData.length, 'registros');
      
      // Armazena dados brutos para filtros
      this.rawData = csvData;
      
      // Usa DataNormalizer para normalizar os dados
      if (typeof DataNormalizer === 'undefined') {
        throw new Error('DataNormalizer não está carregado. Adicione <script src="src/js/DataNormalizer.js"></script> ao HTML');
      }
      
      this.data = DataNormalizer.normalize(csvData);
      console.log('Dados normalizados:', this.data);
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
        name: 'Strategic Portfolio View',
        description: 'Cronograma',
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
      Phase: task.phase || task.name,
      Diretoria: task.diretoria || '',
      'Assessoria | Núcleo | Programas': task.assessoriaOuNucleo || ''
    }));
  }

  /**
   * Retorna lista única de diretorias sem repetição
   * Trata valores separados por vírgula
   */
  getDiretorias() {
    const data = this.rawData || this.data || [];
    if (!Array.isArray(data)) return [];
    
    const diretorias = new Set();
    data.forEach(item => {
      if (item && item.Diretoria) {
        // Divide por vírgula e adiciona cada valor limpo ao Set
        const valores = item.Diretoria.split(',');
        valores.forEach(v => {
          const trimmed = v.trim();
          if (trimmed) diretorias.add(trimmed);
        });
      }
    });
    
    return Array.from(diretorias).sort();
  }

  /**
   * Retorna lista única de Assessoria/Núcleo/Programas sem repetição
   * Trata valores separados por vírgula
   */
  getAssessoriaOuNucleo() {
    const data = this.rawData || this.data || [];
    if (!Array.isArray(data)) return [];
    
    const assessorias = new Set();
    data.forEach(item => {
      if (item && item['Assessoria | Núcleo | Programas']) {
        // Divide por vírgula e adiciona cada valor limpo ao Set
        const valores = item['Assessoria | Núcleo | Programas'].split(',');
        valores.forEach(v => {
          const trimmed = v.trim();
          if (trimmed) assessorias.add(trimmed);
        });
      }
    });
    
    return Array.from(assessorias).sort();
  }

  /**
   * Filtra dados por diretoria com busca parcial
   * Verifica se algum dos valores separados por vírgula corresponde
   */
  filterByDiretoria(diretoria) {
    const data = this.rawData || this.data || [];
    if (!diretoria) return data;
    
    return data.filter(item => {
      if (!item || !item.Diretoria) return false;
      
      // Divide por vírgula e verifica se algum valor contém o filtro
      const valores = item.Diretoria.split(',');
      return valores.some(v => 
        v.trim().toLowerCase().includes(diretoria.toLowerCase())
      );
    });
  }

  /**
   * Filtra dados por Assessoria/Núcleo/Programas com busca parcial
   * Verifica se algum dos valores separados por vírgula corresponde
   */
  filterByAssessoriaOuNucleo(assessoria) {
    const data = this.rawData || this.data || [];
    if (!assessoria) return data;
    
    return data.filter(item => {
      if (!item || !item['Assessoria | Núcleo | Programas']) return false;
      
      // Divide por vírgula e verifica se algum valor contém o filtro
      const valores = item['Assessoria | Núcleo | Programas'].split(',');
      return valores.some(v => 
        v.trim().toLowerCase().includes(assessoria.toLowerCase())
      );
    });
  }

  /**
   * Filtra por ambos os critérios com busca parcial
   */
  filterByDiretoriaAndAssessoria(diretoria, assessoria) {
    const data = this.rawData || this.data || [];
    let filtered = data;
    
    if (diretoria) {
      filtered = filtered.filter(item => {
        if (!item || !item.Diretoria) return false;
        
        // Divide por vírgula e verifica se algum valor contém o filtro
        const valores = item.Diretoria.split(',');
        return valores.some(v =>
          v.trim().toLowerCase().includes(diretoria.toLowerCase())
        );
      });
    }
    
    if (assessoria) {
      filtered = filtered.filter(item => {
        if (!item || !item['Assessoria | Núcleo | Programas']) return false;
        
        const valores = item['Assessoria | Núcleo | Programas'].split(',');
        return valores.some(v =>
          v.trim().toLowerCase().includes(assessoria.toLowerCase())
        );
      });
    }
    
    return filtered;
  }
}

// Exporta para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
