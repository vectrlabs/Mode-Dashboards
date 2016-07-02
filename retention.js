// Build retention by cohort tables
// See: https://help.modeanalytics.com/articles/cohort-analysis-for-customer-retention-and-churn-rate/

var options = [{
  html_element: '#retention_by_cohort',
  query_name: 'Retention & Churn',
  cohort_column: 'Signup Date',
  pivot_column: 'user_period',
  value_column: 'retention_rate',
  total_column: 'New Users',
  title: 'Retention rate by signup date',
  pivot_label: 'Periods after signup',
  value_is_percent: true,
  include_first_period: false,
  positive_colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c'],
  negative_colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d']
}, {
  html_element: '#churn_by_cohort',
  query_name: 'Retention & Churn',
  cohort_column: 'Signup Date',
  pivot_column: 'user_period',
  value_column: 'churn_rate',
  total_column: 'New Users',
  title: 'Churn rate by signup date',
  pivot_label: 'Periods after signup',
  value_is_percent: true,
  include_first_period: false,
  positive_colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d'],
  negative_colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c']
}, {
  html_element: '#churn_from_previous_by_cohort',
  query_name: 'Retention & Churn',
  cohort_column: 'Signup Date',
  pivot_column: 'user_period',
  value_column: 'churn_rate_from_previous_period',
  total_column: 'New Users',
  title: 'Churn rate from previous period',
  pivot_label: 'Periods after signup',
  value_is_percent: true,
  include_first_period: false,
  positive_colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d'],
  negative_colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c']
}];

drawGrid(options[0]);
drawGrid(options[1]);
drawGrid(options[2]);

function drawGrid(o) {

  var htmlElement = o.html_element || 'body';
  colors = o.colors || ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'];

  $(htmlElement).addClass('heatmap-container');

  var data = datasets.filter(function(d) {
      return d.queryName == o.query_name;
    })[0].content,
    columns = datasets.filter(function(d) {
      return d.queryName == o.query_name;
    })[0].columns,
    cohorts = _.uniq(_.map(data, o.cohort_column)),
    unorderedPivots = _.uniq(_.map(data, o.pivot_column)),
    pivots = _.sortBy(unorderedPivots, function(x) {
      return x;
    }),
    filteredDataForColors = data;

  if (o.include_first_period === false) {
    var firstPeriod = pivots[0],
      filteredDataForColors = data.filter(function(d) {
        return d[o.pivot_column] != firstPeriod;
      });

    pivots = pivots.slice(1, 10000);
  }

  var posColor = d3.scale.quantize()
    .domain([0, d3.max(filteredDataForColors, function(d) {
      return d[o.value_column];
    })])
    .range(o.positive_colors);

  var negColor = d3.scale.quantize()
    .domain([d3.min(filteredDataForColors, function(d) {
      return d[o.value_column];
    }), 0])
    .range(o.negative_colors.reverse());

  d3.select(htmlElement)
    .append('div')
    .attr('class', 'heatmap-title')
    .text(function() {
      if (o.title) {
        return o.title;
      }
    });

  d3.select(htmlElement)
    .append('div')
    .attr('class', 'heatmap-pivot-label')
    .text(function() {
      if (o.pivot_label) {
        return o.pivot_label;
      }
    });

  if (o.total_column) {
    headers = [o.cohort_column, o.total_column].concat(pivots);
  } else {
    headers = [o.cohort_column].concat(pivots);
  }

  var table = d3.select(htmlElement).append('table')
    .attr('class', 'heatmap-table');

  table.selectAll('.heatmap-table-header')
    .data([0])
    .enter().append('tr')
    .attr('class', 'heatmap-table-header')
    .selectAll('heatmap-table-header-cell')
    .data(headers)
    .enter().append('td')
    .attr('class', function(d) {
      if (isNaN(d)) {
        return 'heatmap-table-header-cell heatmap-string';
      } else {
        return 'heatmap-table-header-cell heatmap-number';
      }
    })
    .text(function(d) {
      return d;
    });

  table.selectAll('.heatmap-table-row')
    .data(cohorts)
    .enter().append('tr')
    .attr('class', 'heatmap-table-row')
    .selectAll('.heatmap-table-cell')
    .data(function(d) {
      return makeRow(data, d, pivots, o);
    })
    .enter().append('td')
    .style('background', function(d) {
      if (checkShade(d, o)) {
        if (d.value >= 0) {
          return posColor(d.value);
        } else {
          return negColor(d.value);
        }
      }
    })
    .attr('class', function(d) {
      return cellClass(d);
    })
    .text(function(d) {
      var per = fmt(d, o);
      return per !== '' ? per : '---';
    });

  function checkShade(entry, options) {
    if (entry.value === '') {
      return false;
    } else if (entry.column == options.pivot_column || entry.column == options.total_column) {
      return false;
    } else if (entry.column == options.value_column) {
      return true;
    } else {
      return false;
    }
  }

  function cellClass(entry) {
    var type = getDataType(entry.column);

    if (type == 'float' || type == 'integer') {
      return 'heatmap-number';
    } else {
      return 'heatmap-string';
    }
  }

  function getDataType(column) {
    return columns.filter(function(d) {
      return d.name == column;
    })[0].type;
  }

  function makeRow(data, cohort, pivots, options) {
    var row = [{
      column: options.cohort_column,
      value: cohort
    }];

    if (options.total_column) {
      var total = _.filter(data, function(d) {
          return d[options.cohort_column] == cohort;
        })[0],
        totalObject = {
          column: options.total_column,
          value: total[options.total_column]
        };
      row = row.concat(totalObject);
    }

    pivots.forEach(function(p, i) {
      var matches = _.filter(data, function(d) {
        return d[options.cohort_column] == cohort && d[options.pivot_column] == p;
      });

      if (matches.length > 0) {
        entry = d3.mean(_.map(matches, options.value_column));
      } else {
        entry = '';
      }
      row = row.concat({
        column: options.value_column,
        value: entry
      });
    });
    return row;
  }

  function fmt(entry, options) {

    var type = getDataType(entry.column),
      valueColumn = options.value_column,
      totalColumn = options.total_column;

    var c = d3.format(','),
      p = d3.format('.2p'),
      t = d3.time.format('%b %d, %Y'),
      r = d3.time.format('%Y-%m-%dT%H:%M:%S.000Z').parse;

    if (entry.value === '') {
      return entry.value;
    } else if (type == 'datetime' || type == 'timestamp' || type == 'date') {
      var newDate = new Date(Date.parse(entry.value));
      parsedString = r(newDate.toISOString());
      return t(parsedString);
    } else if (entry.column == totalColumn) {
      return c(entry.value);
    } else if (entry.column == valueColumn && options.value_is_percent) {
      return p(entry.value);
    } else if (entry.column == valueColumn && !options.value_is_percent) {
      return c(entry.value);
    } else {
      return entry.value;
    }
  }
}