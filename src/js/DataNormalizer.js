/**
 * DataNormalizer - Normaliza dados do CSV JSON para o formato do Gantt
 * Converte datas em formato "DD/MM/YYYY → DD/MM/YYYY" e organiza por fases
 */
class DataNormalizer {
  /**
   * Converte string de data "DD/MM/YYYY → DD/MM/YYYY" em objeto com start e end
   * @param {string} dateRange - Ex: "01/03/2026 → 31/03/2026"
   * @returns {object} {start: "2026-03-01", end: "2026-03-31"} ou null
   */
  static parseDateRange(dateRange) {
    if (!dateRange || typeof dateRange !== 'string') return null;

    const dates = dateRange.split('→').map(d => d.trim());
    if (dates.length !== 2) return null;

    try {
      const [startStr, endStr] = dates;
      const start = this._parseDate(startStr);
      const end = this._parseDate(endStr);

      if (!start || !end) return null;

      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    } catch (e) {
      console.error('Erro ao parsear datas:', dateRange, e);
      return null;
    }
  }

  /**
   * Converte "DD/MM/YYYY" para Date
   * @private
   */
  static _parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day);
    return date;
  }

  /**
   * Mapeia as fases do CSV para tarefas normalizadas
   * @param {object} project - Objeto do projeto do CSV
   * @param {number} projectId - ID único do projeto
   * @returns {array} Array de tarefas normalizadas
   */
  static normalizeProject(project, projectId) {
    const tasks = [];
    let taskId = projectId * 1000; // ID único para cada tarefa

    const phaseMap = {
      'Dt Planejamento': 'Planejamento',
      'Dt Execução': 'Execução',
      'Dt Contratação': 'Contratação'
    };

    for (const [dateField, phaseName] of Object.entries(phaseMap)) {
      const dateRange = project[dateField];
      if (!dateRange) continue;

      const dates = this.parseDateRange(dateRange);
      if (!dates) continue;

      tasks.push({
        id: taskId++,
        name: `${project['Projeto']} - ${phaseName}`,
        phase: phaseName,
        project: project['Projeto'],
        start: dates.start,
        end: dates.end,
        status: this._mapStatus(project['Status Projeto']),
        progress: project['Evolução Execução'] || 0,
        responsible: project['Responsável'] || '',
        impact: project['Impacto'] || 'Normal',
        description: project['Resumo'] || '',
        sei: project['SEI'] || ''
      });
    }

    return tasks;
  }

  /**
   * Converte status do CSV para formato do Gantt
   * @private
   */
  static _mapStatus(statusStr) {
    const statusMap = {
      'Concluído': 'completed',
      'Em Andamento': 'in-progress',
      'Planejamento': 'not-started',
      'Não iniciado': 'not-started',
      'Em dia': 'in-progress',
      'Atrasado': 'at-risk'
    };

    return statusMap[statusStr] || 'not-started';
  }

  /**
   * Normaliza todo o array de projetos do CSV
   * @param {array} csvData - Array de projetos do CSV
   * @returns {object} Objeto com estrutura do cronograma.json
   */
  static normalize(csvData) {
    if (!Array.isArray(csvData)) {
      console.error('Dados do CSV não são um array');
      return { project: {}, tasks: [] };
    }

    const tasks = [];
    const projects = new Set();

    csvData.forEach((project, index) => {
      if (!project['Projeto']) return;

      projects.add(project['Projeto']);
      const projectId = index + 1;
      const projectTasks = this.normalizeProject(project, projectId);
      tasks.push(...projectTasks);
    });

    return {
      project: {
        name: 'FF Executive Project',
        description: 'Cronograma do Projeto FF Executive',
        startDate: new Date().toISOString().split('T')[0],
        projectCount: projects.size
      },
      tasks: tasks,
      metadata: {
        source: 'CSV Notion',
        normalized: true,
        normalizedAt: new Date().toISOString(),
        projectCount: projects.size,
        taskCount: tasks.length
      }
    };
  }
}

// Exporta para uso em Node.js e navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataNormalizer;
}
