/*eslint quotes: ["off", "double"]*/
import React from 'react'
import {render} from 'react-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import DictumCalendar from './Calendar'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const styles = {
  container: {
    padding: 10
  },
}

const muiTheme = getMuiTheme({})

render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <div style={styles.container}>
      <DictumCalendar />
    </div>
  </MuiThemeProvider>
  , document.getElementById('app')
)
