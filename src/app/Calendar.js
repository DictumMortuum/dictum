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
    this.state.db.allDocs({
      include_docs: true,
      startkey: date,
      //endkey: new Date().toISOString()
    }, function(err, result) {
      var id, doc
      var docs = [], temp = []

      console.log(result)

      for (var i = 0; i < result.total_rows; i++) {
        if (result.rows[i] !== undefined) {
          if (result.rows[i].doc.type !== undefined) {
            doc = result.rows[i].doc
            id = new Date(doc._id).toISOString().substring(0,10)

            if(docs[id] === undefined) {
              docs[id] = []
            }

            docs[id].push(doc)
          }
        }
      }

      for(id in docs) {
        temp.unshift({
          id: id,
          docs: docs[id]
        })
      }

      this.setState({
        docs: temp
      })
    }.bind(this))
  }

  componentDidMount = () => {
    var date = moment(new Date()).subtract(30, 'days').toISOString()
    this.handleDate(date)
  }

  handleToggle = () => {
    console.log(this.state.expanded)
    this.setState({expanded: !this.state.expanded})
  }

  render() {
    var days = this.state.docs.map(doc => {
      console.log(doc)
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
