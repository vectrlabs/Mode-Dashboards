

function getData( datasetName ) {
  return datasets.filter(function(d) {
    return d.queryName === datasetName;
  })[0].content;  
}