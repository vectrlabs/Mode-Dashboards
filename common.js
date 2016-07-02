  /**
   * Get data for a given query.
   * 
   * @param  {String} Name of the query in mode
   */
  function getData( datasetName ) {
    return datasets.filter(function(d) {
      return d.queryName === datasetName;
    })[0].content;  
  }
  
  /**
   * @param  {attrs} Object with:
   * 
   * {
   *  query: 'Query Name in Mode',
   *  col: 'Growth' 
   *     - percentage-based column to take the average of, defaults to 'Growth'
   *  current: [1,2] 
   *     - Rows to use in average, for current period. Rows will be taken from end of data.
   *  prev: [1,2] 
   *     - Rows to use in average, for previous period. Rows will be taken from end of data.
   *  custom_metric: 'wow_growth' 
   *     - Selector for where to print average <div class="custom_metric" custom_metric="visitor_growth">
   * }
   */
  function setAvg( attrs ) {
    var data = getData(attrs.query);

    // Default to 'Growth' column
    attrs.col = attrs.col || 'Growth';
    
    var len = data.length;

    function getAvg( range ) {
      var avg = data.slice(len - range[1], len - range[0]).map(function(p) {
        return p[attrs.col];
      });
      
      return (_.mean(avg) * 100).toFixed(1) + '%';
    }
    
    var $customMetric = $('[custom_metric="' + attrs.custom_metric + '"]');
    
    // Set averages
    $customMetric.find('.custom_metric_curr_num').text( getAvg(attrs.current) );
    $customMetric.find('.custom_metric_prev_num').text( getAvg(attrs.prev) );
  }