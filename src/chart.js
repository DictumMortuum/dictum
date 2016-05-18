// not node.js compatible.

"use strict";

(function() {
  var unit = function(query) {
    var api = {}
    var charts = []
    var colors = ['chart-primary', 'chart-success', 'chart-info', 'chart-warning', 'chart-danger']

    var options = {
      labelInterpolationFnc: function(value) {
        return value[0]
      }
    }

    var responsiveOptions = [
      ['screen and (min-width: 640px)', {
        chartPadding: 30,
        labelOffset: 100,
        labelDirection: 'explode',
        labelInterpolationFnc: function(value) {
          return value;
        }
      }],
      ['screen and (min-width: 1024px)', {
        labelOffset: 80,
        chartPadding: 20
      }]
    ]

    api.init = function(start, end) {

      query.type(start, end, []).then(function(response) {
        console.log(response)
        charts.push(
          new Chartist.Pie('#chart1', api.transform.pie(response), options, responsiveOptions)
        )
      }, function(error) {
        console.error(error)
      })

      query.tool(start, end).then(function(response) {
        console.log(response)
        charts.push(
          new Chartist.Pie('#chart2', api.transform.pie(response), options, responsiveOptions)
        )
      }, function(error) {
        console.log(error)
      })

      $('a[data-toggle="tab"]').on('shown.bs.tab', function(event) {
        for(var i = 0; i < charts.length; i++) {
          charts[i].update()
        }
      })
    }

    api.transform = {}

    function color(i) {
      return colors[i%colors.length]
    }

    api.transform.pie = function(result) {
      var i = 0
      var data = {
        labels: [],
        series: []
      }

      for(var a in result) {
        var d = result[a]

        data.labels.push(a)
        data.series.push({
          value: d,
          className: color(i++)
        })
      }

      return data
    }

    return api
  }

  window.dictum = window.dictum || {}
  window.dictum.chart = unit
})();
