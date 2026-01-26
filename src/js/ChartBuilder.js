/**
 * ChartBuilder - Constrói e gerencia o gráfico de Gantt
 * Responsabilidade: Lógica de visualização e renderização do gráfico
 */

const formatDateBR = (value) => {
  const d = new Date(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

class ChartBuilder {
  constructor(containerId = 'chart-container') {
    this.containerId = containerId;
    this.chart = null;
  }

  buildGanttChart(data) {
    try {
      const trace = this._createTrace(data);
      const layout = this._createLayout(data);
      const config = this._createConfig();

      Plotly.newPlot(this.containerId, trace, layout, config);
      this.chart = document.getElementById(this.containerId);

      // Garante que em mobile o container permita scroll horizontal sem “espremer” o gráfico
      this._applyMobileContainerStyles();
      // Bloqueia scroll do trackpad/mouse
      this._disableWheel();
      return this.chart;
    } catch (error) {
      console.error('Erro ao criar gráfico:', error);
      throw error;
    }
  }

  _isMobile() {
    return window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  }

  _disableWheel() {
    const el = document.getElementById(this.containerId);
    if (!el) return;

    // Permite scroll normal da página, mas bloqueia apenas o zoom do Plotly
    el.addEventListener('wheel', (e) => {
      // Deixa passar normalmente (não faz preventDefault)
      // O scrollZoom: false já deve impedir o Plotly de fazer zoom
    }, { passive: true });
  }

  _applyMobileContainerStyles() {
    const el = document.getElementById(this.containerId);
    if (!el) return;

    // Sempre permitir scroll horizontal (não atrapalha desktop e salva mobile)
    el.style.overflowX = 'auto';
    el.style.webkitOverflowScrolling = 'touch';

    // Em mobile, um min-width ajuda a não esmagar o eixo/labels.
    // Ajuste conforme o tamanho típico do seu cronograma.
    if (this._isMobile()) {
      el.style.minWidth = '980px';
    } else {
      el.style.minWidth = '';
    }
  }

  _createTrace(data) {
    const isMobile = this._isMobile();

    const phaseColors = {
      'Planejamento': '#29b6f6',
      'Execução': '#ffd200',
      'Contratação': '#e53935'
    };

    // Agrupa dados por diretoria primeiro
    const diretoriaMap = new Map();
    data.forEach(item => {
      // Pega a diretoria, dividindo por vírgula se necessário
      const diretorias = (item.Diretoria || 'Sem Diretoria').split(',').map(d => d.trim());
      const diretoria = diretorias[0] || 'Sem Diretoria'; // Usa a primeira diretoria
      
      if (!diretoriaMap.has(diretoria)) {
        diretoriaMap.set(diretoria, []);
      }
      diretoriaMap.get(diretoria).push(item);
    });

    // Ordena diretorias alfabeticamente
    const sortedDiretorias = Array.from(diretoriaMap.keys()).sort();

    // Cria um mapeamento de projeto para label com diretoria
    const projectLabels = new Map();
    sortedDiretorias.forEach(diretoria => {
      const items = diretoriaMap.get(diretoria);
      const projects = [...new Set(items.map(item => item.Project))];
      
      projects.forEach(project => {
        projectLabels.set(project, `[${diretoria}] ${project}`);
      });
    });

    const phaseMap = new Map();

    data.forEach(item => {
      const phase = item.Phase || item.phase || item.Task;
      if (!phaseMap.has(phase)) phaseMap.set(phase, []);
      phaseMap.get(phase).push(item);
    });

    const phaseOrder = ['Planejamento', 'Desenvolvimento', 'Testes', 'Implantação'];
    const sortedPhases = Array.from(phaseMap.keys()).sort((a, b) => {
      const ia = phaseOrder.indexOf(a);
      const ib = phaseOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    const traces = [];

    const truncate = (s, max = 50) => {
      const str = String(s ?? '');
      if (str.length <= max) return str;
      return str.slice(0, Math.max(0, max - 1)) + '…';
    };

    sortedPhases.forEach(phase => {
      const items = phaseMap.get(phase);

      // Ordena items por diretoria
      items.sort((a, b) => {
        const dirA = (a.Diretoria || 'Sem Diretoria').split(',')[0].trim();
        const dirB = (b.Diretoria || 'Sem Diretoria').split(',')[0].trim();
        if (dirA === dirB) {
          return (a.Project || '').localeCompare(b.Project || '');
        }
        return dirA.localeCompare(dirB);
      });

      // Duração em ms (Plotly usa isso para barras com base)
      const durations = items.map(item => {
        const start = new Date(item.Start).getTime();
        const end = new Date(item.End).getTime();
        return end - start;
      });

      const baseDates = items.map(item => new Date(item.Start).toISOString());

      // Para corrigir hover: fim real + nome completo do projeto
      const endDates = items.map(item => new Date(item.End).toISOString());

      const projectFull = items.map(item => item.Project || 'Projeto');
      
      // Cria labels com diretoria
      const projectWithDiretoria = items.map(item => {
        const project = item.Project || 'Projeto';
        return projectLabels.get(project) || project;
      });
      
      // Sempre trunca os labels para o eixo Y (mobile ou desktop)
      const projectAxis = projectWithDiretoria.map(p => 
        truncate(p, isMobile ? 35 : 50)
      );

      traces.push({
        x: durations,
        y: projectAxis,
        base: baseDates,
        name: phase,
        type: 'bar',
        orientation: 'h',
        legendgroup: phase,
        showlegend: !isMobile, // em mobile, legenda tende a ocupar espaço e atrapalhar
        marker: {
          color: phaseColors[phase] || '#999999',
          line: { width: 0 },
          opacity: 0.9
        },
        text: items.map(() => phase),
        textposition: 'none',

        // customdata: [fase, inicio, fim, projetoCompleto]
        customdata: items.map((_, i) => [phase, formatDateBR(baseDates[i]), formatDateBR(endDates[i]), projectFull[i]]),

        // hover com datas reais (não a duração)
        hovertemplate:
          `%{customdata[3]}<br>` +
          `Fase: %{customdata[0]}<br>` +
          `Inicio: %{customdata[1]}<br>` +
          `Fim: %{customdata[2]}<extra></extra>`
      });
    });

    return traces;
  }

  _createLayout(data = []) {
    const isMobile = this._isMobile();

    const today = new Date();
    const startRange = new Date(today.getTime() - 45 * 86400000).toISOString();
    const endRange = new Date(today.getTime() + 45 * 86400000).toISOString();

    // Altura dinâmica por número de projetos/linhas (ajuda muito no mobile)
    const projects = (data || []).map(d => d.Project || 'Projeto');
    const uniqueProjectsCount = new Set(projects).size || 1;
    const baseHeight = isMobile ? 380 : 520;
    const perRow = isMobile ? 34 : 26;
    const height = Math.max(baseHeight, uniqueProjectsCount * perRow + (isMobile ? 160 : 220));

    return {
      barmode: 'overlay',
      bargap: isMobile ? 0.22 : 0.35,
      bargroupgap: 0.1,
      barcornerradius: 6,

      dragmode: 'pan',

      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',

      height,

      font: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        size: isMobile ? 11 : 12,
        color: '#2F3437'
      },

      xaxis: {
        type: 'date',
        side: 'top',
        range: [startRange, endRange],
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.05)',
        zeroline: false,
        showline: false,
        ticks: '',
        title: { text: '' },
        tickfont: { size: isMobile ? 10 : 12 }
      },

      yaxis: {
        autorange: 'reversed',
        showgrid: false,
        showline: false,
        ticks: '',
        automargin: true,
        tickfont: {
          size: isMobile ? 11 : 12,
          color: '#2F3437'
        }
      },

      // Em mobile escondemos a legenda (showlegend false no trace).
      // Em desktop mantém como estava.
      legend: {
        orientation: 'h',
        x: 0.01,
        y: 1.15,
        xanchor: 'left',
        yanchor: 'bottom',
        bgcolor: 'rgba(255,255,255,0.85)',
        borderwidth: 0,
        font: { size: 11 }
      },

      margin: isMobile
        ? { t: 70, r: 20, b: 40, l: 120 }
        : { t: 120, r: 30, b: 60, l: 160 },

      shapes: [
        {
          type: 'line',
          x0: today.toISOString(),
          x1: today.toISOString(),
          y0: 0,
          y1: 1,
          xref: 'x',
          yref: 'paper',
          line: {
            color: 'rgba(255,59,48,0.6)',
            width: 1,
            dash: 'dot'
          }
        }
      ]
    };
  }

  _createConfig() {
    const isMobile = this._isMobile();

    return {
      responsive: true,
      displayModeBar: isMobile ? false : true,
      displaylogo: false,
      scrollZoom: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
  }

  updateChart(data) {
    Plotly.react(
      this.containerId,
      this._createTrace(data),
      this._createLayout(data),
      this._createConfig()
    );

    // Reaplica estilo se houver resize/orientação
    this._applyMobileContainerStyles();

    // Reaplica bloqueio de scroll
    this._disableWheel();
  }

  exportAsImage(filename = 'cronograma.png') {
    Plotly.downloadImage(this.containerId, {
      format: 'png',
      width: 1200,
      height: 600,
      filename
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartBuilder;
}
