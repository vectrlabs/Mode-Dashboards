// Draw Steps between a funnel
// Mostly based on https://modeanalytics.com/benn/reports/aada9f1f999c

var p = d3.format('.3p');

function drawFunnel() {

  var $funnel = $('#funnel svg');
  var funnel = d3.selectAll('#funnel svg');

  d3.selectAll('#funnel svg .r').remove();    

  var svgTrans = getTrans($funnel.find('g.nvd3.nv-wrap g').attr('transform'));
  var $bars = $funnel.find('.nv-barsWrap .nv-groups .nv-bar');
  var funnelObj = [];
  var barWidth, barHeight;

  // - Get data for each bar in the chart
  $bars.each(function(i) {
    var $bar = $(this).find('rect');
    var value = +$(this).find('text').text().replace(/,/g, '');
  
    var barTrans = getTrans( $(this).attr('transform') );
    
    barWidth = $bar.attr('width');
    barHeight = $bar.attr('height');
    
    // Adjust the width of the bars. Not sure if we want this.
    // $bar.attr('width',barWidth/2);
    // $bar.attr('transform','translate(' + barWidth / 4 + ',0)');
  
    obj = { step: i, value: value, x: barTrans[0], y: barTrans[1], h: barHeight};
    funnelObj.push(obj);
  });
  
  //- Append %'age change between each step of the funnel
  funnelObj.forEach(function(d,i) {
    if (i === 0) return;
  
    var h = 30;
    var x = d.x + svgTrans[0] + barWidth/8;
    var y = Math.min(svgTrans[1] + d.y + d.h/2 - h/2, svgTrans[1] + d.y + d.h/1 - h);
    var w = barWidth/2;
  
    var value = p(d.value/funnelObj[i-1].value);
  
    var pts = (x-w) + ',' + y + ' ' +
              (x-0.2* w) + ',' + y + ' ' +
              x + ',' + (y+h/2) + ' ' +
              (x-0.2*w) + ',' + (y+h) + ' ' +
              (x-w) + ',' + (y+h);
            
    funnel.append('polygon')
        .attr('points',pts)
        .attr('class','mode-bar-chart-funnel-background r');
  
    funnel.append('text')
        .attr('x',(x - w*0.6))
        .attr('y',y + h/2)
        .attr('dy','.37em')
        .attr('text-anchor','middle')
        .attr('class','mode-bar-chart-funnel-label r')
        .style('font-size','12px')
        .text(value);
  });

}

//- Get a Transform
function getTrans(translation) {
  var openPos = translation.indexOf("("),
      closePos = translation.indexOf(")"),
      commaPos = translation.indexOf(",");
    
  var xTrans = +translation.slice(openPos+1,commaPos),
      yTrans = +translation.slice(commaPos+1,closePos);
    
  return [xTrans,yTrans];
}

setTimeout(function(){ 
  drawFunnel();
}, 750);

$(window).resize(function () {
  waitForFinalEvent(function(){
    drawFunnel();
  },  500, '');
});

var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();