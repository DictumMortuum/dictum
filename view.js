var view = (function ($, $$$) {

  var db = $$$.database('work', 'localhost:5984/work')

  function handle (doc) {
    // Ignore design documents
    if (doc._id.startsWith('_design')) {
      return
    }

    var date = new Date(doc._id)

    var args = {
      month: date.getFullYear() + '' + date.getMonth(),
      day: date.toDateString().replace(/\s/g, ''),
      mdesc: date.toLocaleString(config.locale, {month: 'long', year: 'numeric'}),
      ddesc: date.toLocaleString(config.locale, {weekday: 'short', day: 'numeric'})
    }

    // Insert a new month element
    // args: month, mdesc
    if ($('#' + args.month).length === 0) {
      $($$$.template('month', args)).prependTo('#home')
    }

    // Insert a new day element.
    // args: day, date
    if ($('#' + args.day).length === 0) {
      $($$$.template('group', args)).prependTo('#' + args.month)
    }

    var opt = {lang: '', ticket: '', type: ''}

    // If ticket number exists, add it as a special tag.
    if (doc.ticket !== undefined) {
      if (doc.ticket.search(/-/i) === -1) {
        var n = doc.ticket.search(/[A-Z][0-9]/i) + 1
        doc.ticket = [doc.ticket.slice(0, n), '-', doc.ticket.slice(n)].join('')
      }

      opt.ticket = tpl('btn', {
        type: 'btn-danger',
        desc: doc.ticket,
        href: 'https://jira.openbet.com/browse/' + doc.ticket
      })
    }

    if (doc.finish === undefined) {
      opt.date = date.toLocaleString(config.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    } else {
      opt.date = date.toLocaleString(config.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }) + ' to ' + (new Date(doc.finish)).toLocaleString(config.locale, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    }

    // Add the programming languages as tags.
    if (doc.lang !== undefined) {
      for (var i = doc.lang.length - 1; i >= 0; i--) {
        opt.lang += tpl('btn', {
          type: 'btn-success',
          desc: doc.lang[i],
          href: '#'
        })
      };
    }

    // Create the list element.
    $($$$.template('list', {
      id: doc._id,
      desc: doc.desc,
      lang: opt.lang,
      ticket: opt.ticket,
      /* date:   tpl('btn', {
         type: "btn-custom",
         desc: opt.date,
         href: "#"
      }),*/
      date: opt.date,
      type: $$$.template('btn', {
        type: 'btn-info',
        desc: doc.type,
        href: '#'
      })
    })).appendTo('#' + args.day)
  }

  function query (options) {
    $('#home').html("")

    db.allDocs(options).then(function (result) {
      for (var i = 0; i < result.total_rows; i++) {
        if (result.rows[i] !== undefined) {
          handle(result.rows[i].doc)
        }
      }

      $('.parsed').linkify({
        target: '_blank'
      }).removeClass('parsed')

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

      graph($$$.count.type, '#chart5', options)
      graph($$$.count.tool, '#chart6', options)
    }).catch(function (err) {
      console.log(err)
    })
  }

  function range (start, end) {
    $('#calendar span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))

    query({
      include_docs: true,
      startkey: start._d.toJSON(),
      endkey: end._d.toJSON()
    })
  }

  function graph (callback, anchor, options) {
    $$$.count.day(options.startKey, options.endKey).then(function (day) {
      var weight = {}

      for (var j = 0; j < day.rows.length; j++) {
        weight[day.rows[j].key] = day.rows[j].value
      }

      callback(options.startkey, options.endkey, weight).then(function (result) {
        console.log(result)

        var data = []

        for (var i = 0; i < result.rows.length; i++) {
          data[i] = {
            data: result.rows[i].value,
            color: config.color[i % config.color.length],
            label: result.rows[i].key
          }
        }

        if (data.length > 0) {
          $.plot(anchor, data, {
            series: {
              pie: {
                show: true,
                combine: {
                  color: '#999',
                  threshold: 0.025
                }
              }
            },
            legend: {
              show: false
            },
            grid: {
              hoverable: true
            }
          })
        }
      }).catch(function (err) {
        console.log(err)
      })
    })
  }

  $(document).ready(function() {
    $('#calendar').daterangepicker({
      ranges: {
        'Today': [moment().startOf('day'), moment()],
        'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days').startOf('day'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days').startOf('day'), moment()],
        'This Month': [moment().startOf('month').startOf('day'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('day'), moment().subtract(1, 'month').endOf('month')]
      }
    }, range)

    $.getJSON(config.json, function (data) {
      var db = new PouchDB(data.couchdb + '/' + config.db)

      // Sync with the remote database locally and when finished, execute the query.
      localDB.sync(db).on('complete', function () {
        range(moment().subtract(29, 'days'), moment())
      }).on('error', function (err) {
        console.log(err)
      })

      // Listen to remote db changes.
      db.changes({
        since: 'now',
        live: true,
        include_docs: true
      }).on('change', function (result) {
        console.log(result)

        if (result.deleted !== undefined && result.deleted === true) {
          $('#' + result._id).hide()
        } else {
          handle(result.doc)
        }

        $('.parsed').linkify({
          target: '_blank'
        }).removeClass('parsed')
      }).on('complete', function (info) {
        // changes() was canceled
      }).on('error', function (err) {
        console.log(err)
      })
    })
  })
})(jQuery, window.dictum || {});

$(function () {

})
