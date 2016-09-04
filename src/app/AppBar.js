import React from 'react'
import AppBar from 'material-ui/AppBar'
import DatePicker from 'material-ui/DatePicker'

const styles = {
  title: {
    cursor: 'pointer',
  },
}

export default class DictumAppBar extends React.Component {

  constructor(props) {
    super(props)
    this.state = {open: false}
  }

  render() {
    return (
      <div>
        <AppBar
          title={<span style={styles.title}>Dictum</span>}
          onLeftIconButtonTouchTap={this.props.toggle}
          zDepth={1}
          iconElementRight={
            <div style={{display:'flex'}}>
              <DatePicker
                style={{paddingRight: 10}}
                inputStyle={{color: 'white'}}
                hintText="From"
                locale="el-GR"
                DateTimeFormat={global.Intl.DateTimeFormat}
                autoOk={true}
                container="inline"
                onChange={this.props.from}
              />
              <DatePicker
                inputStyle={{color: 'white'}}
                hintText="To"
                locale="el-GR"
                DateTimeFormat={global.Intl.DateTimeFormat}
                autoOk={true}
                container="inline"
                onChange={this.props.to}
              />
            </div>}
        />
      </div>
    )
  }
}

DictumAppBar.propTypes = {
  from: React.PropTypes.func,
  to: React.PropTypes.func,
  toggle: React.PropTypes.func,
}
