// Generated by LiveScript 1.2.0
(function(){
  var width, height, canvas, svg, inspector, stationLabel, rainfallLabel, minLatitude, maxLatitude, minLongitude, maxLongitude, dy, dx;
  width = 600;
  height = 800;
  canvas = d3.select('body').append('canvas').attr('width', width).attr('height', height).style('position', 'absolute').style('top', '0px').style('left', '0px')[0][0].getContext('2d');
  svg = d3.select('body').append('svg').attr('width', width).attr('height', height).style('position', 'absolute').style('top', '0px').style('left', '0px');
  inspector = d3.select('body').append('div').attr('class', 'inspector').style('opacity', 0);
  stationLabel = inspector.append("p");
  rainfallLabel = inspector.append("p");
  minLatitude = 21.5;
  maxLatitude = 25.5;
  minLongitude = 119.5;
  maxLongitude = 122.5;
  dy = (maxLatitude - minLatitude) / height;
  dx = (maxLongitude - minLongitude) / width;
  d3.json("twCounty2010.topo.json", function(countiestopo){
    var counties, proj, path, g;
    counties = topojson.feature(countiestopo, countiestopo.objects['twCounty2010.geo']);
    proj = function(arg$){
      var x, y;
      x = arg$[0], y = arg$[1];
      return [(x - minLongitude) / dx, height - (y - minLatitude) / dy];
    };
    path = d3.geo.path().projection(proj);
    g = svg.append('g').attr('id', 'taiwan').attr('class', 'counties');
    g.selectAll('path').data(counties.features).enter().append('path').attr('class', function(){
      return 'q-9-9';
    }).attr('d', path);
    return d3.json("stations.json", function(stations){
      var root, current, rainData, samples, distance, idwInterpolate, colorOf, yPixel, plotInterpolatedData;
      svg.selectAll('circle').data(stations).enter().append('circle').style('stroke', 'black').style('fill', 'none').attr('r', 2).attr("transform", function(it){
        return "translate(" + proj([+it.longitude, +it.latitude]) + ")";
      });
      root = new Firebase("https://cwbtw.firebaseio.com");
      current = root.child("rainfall/2013-07-13/23:50:00");
      rainData = {};
      samples = {};
      distance = function(arg$, arg1$){
        var x1, y1, x2, y2;
        x1 = arg$[0], y1 = arg$[1];
        x2 = arg1$[0], y2 = arg1$[1];
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      };
      idwInterpolate = function(samples, power, point){
        var sum, sumWeight, i$, len$, s, d, weight;
        sum = 0.0;
        sumWeight = 0.0;
        for (i$ = 0, len$ = samples.length; i$ < len$; ++i$) {
          s = samples[i$];
          d = distance(s, point);
          if (d === 0.0) {
            return s[2];
          }
          weight = Math.pow(d, -power);
          sum = sum + weight;
          sumWeight = sumWeight + weight * s[2];
        }
        return sumWeight / sum;
      };
      colorOf = function(z){
        var c;
        c = (500.0 - z) / 500.0 * 240;
        return d3.hsl(c, 0.4, 0.6).toString();
      };
      yPixel = 0;
      plotInterpolatedData = function(){
        var renderLine;
        yPixel = height;
        renderLine = function(){
          var i$, to$, xPixel, y, x, z, ref$;
          if (yPixel >= 0) {
            for (i$ = 0, to$ = width; i$ <= to$; i$ += 2) {
              xPixel = i$;
              y = minLatitude + dy * yPixel;
              x = minLongitude + dx * xPixel;
              z = 0 > (ref$ = idwInterpolate(samples, 2.75, [x, y])) ? 0 : ref$;
              canvas.fillStyle = colorOf(z);
              canvas.fillRect(xPixel, height - yPixel, 2, 2);
            }
            yPixel = yPixel - 2;
            return setTimeout(renderLine, 0);
          }
        };
        return renderLine();
      };
      return current.on('value', function(it){
        var res$, i$, ref$, len$, st;
        rainData = it.val();
        res$ = [];
        for (i$ = 0, len$ = (ref$ = stations).length; i$ < len$; ++i$) {
          st = ref$[i$];
          if (rainData[st.name] != null && !isNaN(rainData[st.name]['today'])) {
            res$.push([+st.longitude, +st.latitude, parseFloat(rainData[st.name]['today'])]);
          }
        }
        samples = res$;
        svg.selectAll('circle').data(stations).style('fill', function(st){
          if (rainData[st.name] != null && !isNaN(rainData[st.name]['today'])) {
            return colorOf(parseFloat(rainData[st.name]['today']));
          } else {
            return 'None';
          }
        }).on('mouseover', function(d, i){
          inspector.transition().duration(200).style('opacity', 0.9);
          stationLabel.text(d.name);
          rainfallLabel.text(rainData[d.name] != null && !isNaN(rainData[d.name]['today']) ? rainData[d.name]['today'] : "-");
          inspector.style('left', d3.event.pageX + "px");
          return inspector.style('top', d3.event.pageY + "px");
        }).on('mouseout', function(d){
          return inspector.transition().duration(500).style('opacity', 0.0);
        });
        return plotInterpolatedData();
      });
    });
  });
}).call(this);