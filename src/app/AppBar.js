import React from 'react'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
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

  handleToggle = () => this.setState({open: !this.state.open})

  render() {
    return (
      <div>
        <AppBar
          title={<span style={styles.title}>Dictum</span>}
          //onLeftIconButtonTouchTap={this.handleToggle}
          onLeftIconButtonTouchTap={this.props.click}
          zDepth={1}
          iconElementRight={
            <DatePicker
              hintText="From"
              autoOk={true}
              container="inline"
              onChange={this.props.update}
            />}
        />
        <Drawer openSecondary={true} open={this.state.open}>
          <MenuItem>
            <DatePicker hintText="From" container="inline" />
          </MenuItem>
          <MenuItem>
            <DatePicker hintText="To" container="inline" />
          </MenuItem>
        </Drawer>
      </div>
    )
  }
}

DictumAppBar.propTypes = {
  update: React.PropTypes.func,
  click: React.PropTypes.func,
}
