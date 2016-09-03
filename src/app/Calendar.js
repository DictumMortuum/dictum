/*eslint no-console: "off"*/
import React, {Component} from 'react'
import DictumAppBar from './AppBar'
import DictumDay from './Day'
import pouchdb from 'pouchdb'
import moment from 'moment'

export default class DictumCalendar extends Component {
  constructor(props, context) {
    super(props, context)

    this.handleDate = this.handleDate.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)

    this.state = {
      db: new pouchdb('http://localhost:5984/work'),
      open: false,
      expanded: false,
      docs: []
    }
  }

  handleDate = (_, date) => {

    if (date === undefined) {
      date = moment(new Date()).subtract(30, 'days').toISOString()
    }

    this.state.db.allDocs({
      include_docs: true,
      startkey: date,
      //endkey: new Date().toISOString()
    }, function(err, result) {
      this.setState({
        docs: result.rows
      })
    }.bind(this))

    this.state.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function(change) {
      this.setState({
        docs: this.state.docs.concat([change])
      })
    }.bind(this)).on('complete', function(info) {
      console.log(info)
    }).on('error', function (err) {
      console.log(err)
    })
  }

  componentDidMount = () => {
    this.handleDate()
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
        <DictumAppBar click={this.handleToggle} update={this.handleDate} />
        {days}
      </div>
    )
  }
}
