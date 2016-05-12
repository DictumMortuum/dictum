//requires template.js

"use strict";

(function() {
  var unit = function(template) {
    var api = {}

    function ticketParser(ticket) {
      //make sure that there is a dash between jira project name and ticket number.
      if(ticket.search(/-/i) === -1) {
        var n = ticket.search(/[A-Z][0-9]/i) + 1
        var t = [ticket.slice(0, n), '-', ticket.slice(n)].join('')
      } else {
        var t = ticket
      }

      return template.render('btn', {
        type: 'btn-danger',
        desc: ticket,
        href: 'https://jira.openbet.com/browse/' + t
      })
    }

    function langParser(lang) {
      var html = ""

      for (var i = lang.length - 1; i >= 0; i--) {
        html += template.render('btn', {
          type: 'btn-success',
          desc: lang[i],
          href: '#'
        })
      }

      return html
    }

    function dateParser(date) {
      var d = new Date(date)

      var config = {}
      config.locale = 'el'

      return {
        month: d.getFullYear() + '' + d.getMonth(),
        day: d.toDateString().replace(/\s/g, ''),
        mdesc: d.toLocaleString(config.locale, {month: 'long', year: 'numeric'}),
        ddesc: d.toLocaleString(config.locale, {weekday: 'short', day: 'numeric'})
      }
    }

    function typeParser(type) {
      return template.render('btn', {
        type: 'btn-info',
        desc: type,
        href: '#'
      })
    }

    api.handle = function(doc) {
      var resp = {}
      var args = dateParser(doc._id)

      if (doc._id.startsWith('_design')) {
        return resp
      }

      // Adding doc identification in response for deletion
      resp.id = doc._id
      resp.rev = doc._rev

      // Put the date object in the response
      resp.date = args

      // Insert a new month element
      // args: month, mdesc
      resp.month = template.render('month', args)

      // Insert a new day element.
      // args: day, date
      resp.day = template.render('group', args)

      var opt = {
        id: doc._id,
        desc: doc.desc || "",
        lang: "",
        ticket: "",
        type: ""
      }

      if(doc.lang !== undefined) {
        opt.lang = langParser(doc.lang)
      }

      if(doc.ticket !== undefined) {
        opt.ticket = ticketParser(doc.ticket)
      }

      if(doc.type !== undefined) {
        opt.type = typeParser(doc.type)
      }

      // Add the element to the response.
      resp.element = template.render('list', opt)

      return resp
    }

    api.init = function() {
      var tpl = []
      var templates = ['btn', 'form', 'group', 'list', 'month']

      for(var i = 0; i < templates.length; i++) {
        tpl.push(template.load(templates[i]))
      }

      return Promise.all(tpl)
    }

    return api
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    var moment = reqire('moment')
    module.exports = unit
  } else {
    var moment = window.moment
    window.dictum = window.dictum || {}
    window.dictum.parser = unit
  }
})();
