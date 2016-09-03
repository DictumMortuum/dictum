/*eslint no-console: "off"*/
import React from 'react'
import {Card, CardHeader, CardText} from 'material-ui/Card'
import DictumDoc from './Doc'

export default class DictumDay extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      docs: props.docs,
      date: props.date,
      expanded: props.expanded,
      style: {
        marginTop: 10,
        background: '#F5F5F5'
      },
      paperStyle: {
        padding: 10,
        paddingTop: 0
      }
    }
  }

  handleExpandChange = (expanded) => {
    console.log(this.state.expanded)
    this.setState({expanded: expanded})
  }

  render() {
    if(this.state.docs !== undefined) {
      var docs = this.state.docs.map(doc => {
        return (
          <DictumDoc key={doc._id} doc={doc} />
        )
      })
    }

    var date = new Date(this.state.date).toLocaleDateString('el-GR', {
      year: 'numeric', month: 'short', day: 'numeric', weekday: 'long'
    })

    return (
      <Card
        style={this.state.style}
        expanded={this.state.expanded}
        onExpandChange={this.handleExpandChange}
      >
        <CardHeader
          title={date}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText style={this.state.paperStyle} expandable={true}>
          {docs}
        </CardText>
      </Card>
    )
  }
}

DictumDay.propTypes = {
  docs: React.PropTypes.array,
  date: React.PropTypes.string,
  expanded: React.PropTypes.boolean
}
