/**
 * ChartBuilder - Constrói e gerencia o gráfico de Gantt
 * Responsabilidade: Lógica de visualização e renderização do gráfico
 */
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

      return this.chart;
    } catch (error) {
      console.error('Erro ao criar gráfico:', error);
      throw error;
    }
  }

  _createTrace(data) {
    const phaseColors = {
      'Planejamento': '#29b6f6',
      'Execução': '#ffd200',
      'Contratação': '#e53935'
    };

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

    sortedPhases.forEach(phase => {
      const items = phaseMap.get(phase);

      const durations = items.map(item => {
        const start = new Date(item.Start).getTime();
        const end = new Date(item.End).getTime();
        return end - start;
      });

      const baseDates = items.map(item =>
        new Date(item.Start).toISOString()
      );

      const projects = items.map(item => item.Project || 'Projeto');

      traces.push({
        x: durations,
        y: projects,
        base: baseDates,
        name: phase,
        type: 'bar',
        orientation: 'h',
        legendgroup: phase,
        showlegend: true,
        marker: {
          color: phaseColors[phase] || '#999999',
          line: { width: 0 },
          opacity: 0.9
        },
        text: items.map(() => phase),
        textposition: 'none',
        hovertemplate: `%{y}<br>Fase: %{text}<br>Inicio: %{base}<br>Fim: %{x}<extra></extra>`
      });
    });

    return traces;
  }

  _createLayout(data = []) {
    const today = new Date();
    const startRange = new Date(today.getTime() - 45 * 86400000).toISOString();
    const endRange = new Date(today.getTime() + 45 * 86400000).toISOString();

    return {
      barmode: 'overlay',
      bargap: 0.35,
      bargroupgap: 0.1,
      barcornerradius: 6,

      dragmode: 'pan',

      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',

      font: {
        family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        size: 12,
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
        title: { text: '' }
      },

      yaxis: {
        autorange: 'reversed',
        showgrid: false,
        showline: false,
        ticks: '',
        automargin: true,
        tickfont: {
          size: 12,
          color: '#2F3437'
        }
      },

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

      margin: { t: 120, b: 60 },

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
    return {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
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
