var localDB

var config = {
  locale: 'gr',
  color: ['#337ab7', '#5cb85c', '#5bc0de', '#f0ad4e', '#d9534f'],
  db: 'work_backup',
  json: 'https://dl.dropboxusercontent.com/u/20183245/scripts/dyndns/ip.json'
}

var template = {
  list:
  	'<div class="list-group-item clearfix" id="{{id}}">\
  		<div class="row">\
  			<div style="float:left;">{{date}}</div>\
  			<span class="pull-right">\
  				{{{ticket}}}\
  			</span>\
  		</div>\
  		<div class="row">\
  			<div class="text parsed">{{{desc}}}</div>\
  		</div>\
  		<div class="row">\
  			<span class="pull-left">\
  				{{{type}}}\
  				{{{lang}}}\
  			</span>\
  			<button type="button" class="btn btn-danger btn-circle pull-right"><i class="glyphicon glyphicon-ok"></i></button>\
  		</div>\
  	</div>',
  form:
  	'<div class="list-group-item clearfix">\
  	<form class="form-inline" role="form">\
  		<div class="form-group">\
  			<input class="form-control large" placeholder="Description">\
  			<button type="submit" class="btn btn-default right">Submit</button>\
  			<input class="form-control right" placeholder="Ticket">\
  			<input class="form-control right" placeholder="Type">\
  		</div>\
  	</form>\
  	</div>',
  group:
  	'<div class="list-group col-xs-12 col-md-12" id="{{day}}">\
  		<div class="list-group-item list-group-item-heading">{{ddesc}}</div>\
  	</div>',
  btn:
  	'<a class="btn btn-xs {{type}} btn-margin" type="button" href="{{href}}">{{desc}}</a> ',
  month:
  	'<div class="row">\
  		<div class="panel panel-custom h2">\
  		  <div class="panel-body">\
  		    {{mdesc}}\
  		  </div>\
  		</div>\
  	</div>\
  	<div class="row" id="{{month}}">\
  	</div>'
}

function tpl (selector, data) {
  Mustache.parse(template[selector])
  var rendered = Mustache.render(template[selector], data)
  return rendered
}

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
    $(tpl('month', args)).prependTo('#home')
  }

  // Insert a new day element.
  // args: day, date
  if ($('#' + args.day).length === 0) {
    $(tpl('group', args)).prependTo('#' + args.month)
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
  $(tpl('list', {
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
    type: tpl('btn', {
      type: 'btn-info',
      desc: doc.type,
      href: '#'
    })
  })).appendTo('#' + args.day)
}

function query (options) {
  $('#home').html("")

  localDB.allDocs(options).then(function (result) {
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

    graph(countType, '#chart5', options)
    graph(countTool, '#chart6', options)
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

function countDay (startTime, endTime) {
  return localDB.query({
    map: function (doc, emit) {
      emit(doc._id.slice(0, 10))
    },
    reduce: '_count'
  }, {
    group: true,
    reduce: true
  })
}

function countTool (startTime, endTime) {
  return localDB.query({
    map: function (doc, emit) {
      if (doc._id > startTime && doc._id < endTime) {
        if (doc.lang !== undefined) {
          for (var i = 0; i < doc.lang.length; i++) {
            emit(doc.lang[i].toLowerCase())
          }
        }
      }
    },
    reduce: '_count'
  }, {
    group: true,
    reduce: true
  })
}

function countType (startTime, endTime, weight) {
  return localDB.query({
    map: function (doc, emit) {
      if (doc._id > startTime && doc._id < endTime) {
        emit(doc.type, 1 / (weight[doc._id.slice(0, 10)] || 1))
      }
    },
    reduce: '_sum'
  }, {
    group: true,
    reduce: true
  })
}

function graph (callback, anchor, options) {
  countDay(options.startKey, options.endKey).then(function (day) {
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

$(function () {
  localDB = new PouchDB(config.db)

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
