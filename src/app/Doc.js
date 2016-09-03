/*eslint no-console: "off"*/
import React from 'react'
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import RaisedButton from 'material-ui/RaisedButton'

export default class DictumDoc extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      doc: props.doc,
      style: {
        marginBottom: 10
      }
    }
  }

  handleDelete = () => {
    this.setState({
      doc: {
        _deleted: true
      }
    })
  }

  render() {
    if(this.state.doc._deleted !== undefined) {
      return null
    }

    if(this.state.doc.ticket !== undefined) {
      var t = 'https://jira.openbet.com/browse/' + this.state.doc.ticket

      var ticket = (
        <RaisedButton
          label={this.state.doc.ticket}
          href={t}
          primary={true}
        />
      )
    }

    if(this.state.doc.lang !== undefined) {
      var lang = this.state.doc.lang.map(lang => {
        return (
          <FlatButton key={lang} label={lang} />
        )
      })
    }

    var avatar = (
      <FloatingActionButton
        mini={true} secondary={true}
        onTouchTap={this.handleDelete}
        zDepth={1}
      >
        <FontIcon className="material-icons">clear</FontIcon>
      </FloatingActionButton>
    )

    var date = new Date(this.state.doc._id).toLocaleTimeString('el-GR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

    if (this.state.doc.lang !== undefined || this.state.doc.ticket !== undefined) {
      var actions = (
        <CardActions>
          {ticket}
          {lang}
        </CardActions>
      )
    }

    return (
      <Card style={this.state.style}>
        <CardHeader
          title={date}
          subtitle={this.state.doc.type}
          avatar={avatar}
        />
        <CardText>{this.state.doc.desc}</CardText>
        <Divider />
        {actions}
      </Card>
    )
  }
}

DictumDoc.propTypes = {
  doc: React.PropTypes.object
}
