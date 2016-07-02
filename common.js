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
   * modifyData
   *     - Optional. Function to modify the data before getting the average.
   * }
   */
  function setAvg( attrs ) {
    var data = getData(attrs.query);
    
    // Optionally Filter data
    if( attrs.filter ) data = data.filter( attrs.filter );

    // Default to 'Growth' column
    attrs.col = attrs.col || 'Growth';
    
    var len = data.length;

    // console.log('data', data)

    function getAvg( range ) {
      var avg = data.slice(len - range[1], len - range[0]).map(function(p) {
        return p[attrs.col];
      });
      
      avg = avg.filter(function( p ) {
        return !!p ? p : false;
      });

      return (_.mean(avg) * 100).toFixed(1) + '%';
    }
    
    var $customMetric = $('[custom_metric="' + attrs.custom_metric + '"]');
    
    // Set averages
    $customMetric.find('.custom_metric_curr_num').text( getAvg(attrs.current) );
    $customMetric.find('.custom_metric_prev_num').text( getAvg(attrs.prev) );
  }