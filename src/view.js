// not node.js compatible.

"use strict";

(function() {
  var unit = function(db, parser) {
    var api = {}

    function parse(start, end) {
      var options = {}

      if(start !== undefined) {
        options.start = start
      }

      if(end !== undefined) {
        options.end = end
      }

      return options
    }

    function handle(doc) {
      // Insert a new month element
      // args: month, mdesc
      if ($('#' + doc.date.month).length === 0) {
        $(doc.month).prependTo('#home')
      }

      // Insert a new day element.
      // args: day, date
      if ($('#' + doc.date.day).length === 0) {
        $(doc.day).prependTo('#' + doc.date.month)
      }

      $(doc.element).appendTo('#' + doc.date.day)
    }

    function range(start, end) {
      api.docs(start, end).then(function(docs) {
        $('#calendar span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))
        $('#home').html("")

        for(var i = 0; i < docs.length; i++) {
          handle(docs[i])
        }

        $('.list-group-item-heading').click(function (e) {
          if (e.ctrlKey) {
            $('.clearfix').toggle()
            $('.list-group').toggleClass('col-xs-3').toggleClass('col-md-1')
            $('.list-group').toggleClass('col-xs-12').toggleClass('col-md-12')
          } else {
            $(this).parent().find('.clearfix').toggle()
            $(this).parent().toggleClass('col-xs-3').toggleClass('col-md-1')
            $(this).parent().toggleClass('col-xs-12').toggleClass('col-md-12')
          }
        })

        $('.btn-circle').click(function () {
          console.log($(this).closest('list-group-item').attr('id'))
          $(this).toggleClass('btn-danger')
        })

        $('.list-group-item-heading:not(:first)').click()
      })
    }

    api.docs = function(start, end) {
      var lookup = []

      function callback(doc) {
        lookup.push(parser.handle(doc))
      }

      return new Promise(function(resolve, reject) {
        db.query(callback, parse(start, end)).then(function() {
          resolve(lookup)
        })
      })
    }

    api.init = function() {
      $('#calendar').daterangepicker({
        ranges: {
          'Today': [moment().startOf('day'), moment()],
          'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days')],
          'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment()],
          'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment()],
          'This Month': [moment().startOf('month'), moment().endOf('month')],
          'Last Month': [moment().subtract(1, 'month'), moment().subtract(1, 'month').endOf('month')],
          'This Year': [moment().startOf('year'), moment().endOf('year')],
          'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
        }
      }, function(start, end) {
        range(start, end)
      })

      range(moment().startOf('month'), moment().endOf('month'))
    }

    return api
  }

  window.dictum = window.dictum || {}
  window.dictum.view = unit
})();
