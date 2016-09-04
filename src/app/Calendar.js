/*eslint no-console: "off"*/
import React, {Component} from 'react'
import DictumAppBar from './AppBar'
import DictumDay from './Day'
import pouchdb from 'pouchdb'
import moment from 'moment'

export default class DictumCalendar extends Component {
  constructor(props, context) {
    super(props, context)

    this.handleFrom = this.handleFrom.bind(this)
    this.handleTo = this.handleTo.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
    this.handleRange = this.handleRange.bind(this)

    this.state = {
      db: new pouchdb('http://localhost:5984/work'),
      sync: undefined,
      open: false,
      expanded: false,
      date: {
        from: moment(new Date()).startOf('day').subtract(30, 'days').toISOString(),
        to: moment(new Date()).toISOString()
      },
      docs: []
    }
  }

  handleRange = () => {
    this.state.db.allDocs({
      include_docs: true,
      startkey: this.state.date.from,
      endkey: this.state.date.to
    }, function(err, result) {
      this.setState({
        docs: result.rows
      })
    }.bind(this))

    if (this.state.sync !== undefined) {
      this.state.sync.cancel()
    }

    var sync = this.state.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function(change) {
      if (change.deleted) {
        console.log('deleted')
      } else {
        this.setState({
          docs: this.state.docs.concat([change])
        })
      }
    }.bind(this)).on('complete', function(info) {
      console.log(info)
    }).on('error', function (err) {
      console.log(err)
    })

    this.setState({
      sync: sync
    })
  }

  handleTo = (_, date) => {
    this.setState({
      date: {
        from: this.state.date.from,
        to: moment(date).endOf('day').toISOString()
      }
    })
    this.handleRange()
  }

  handleFrom = (_, date) => {
    this.setState({
      date: {
        from: moment(date).startOf('day').toISOString(),
        to: this.state.date.to
      }
    })
    this.handleRange()
  }

  componentDidMount = () => {
    this.handleRange()
  }

  handleToggle = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render() {
    var i, id, doc, docs = [], temp = []

    for (i = 0; i < this.state.docs.length; i++) {
      if (this.state.docs[i].doc !== undefined && this.state.docs[i].doc.type !== undefined) {

        doc = this.state.docs[i].doc
        id = new Date(doc._id).toISOString().substring(0,10)

        if(docs[id] === undefined) {
          docs[id] = []
        }
        docs[id].push(doc)
      }
    }

    for(id in docs) {
      temp.unshift({
        id: id,
        docs: docs[id]
      })
    }

    var days = temp.map(doc => {
      return (
        <DictumDay
          key={doc.id}
          docs={doc.docs}
          date={doc.id}
          expanded={this.state.expanded}
        />
      )
    })

    return (
      <div>
        <DictumAppBar
          toggle={this.handleToggle}
          from={this.handleFrom}
          to={this.handleTo}
        />
        {days}
      </div>
    )
  }
}
