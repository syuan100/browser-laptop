/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')

// Components
const ReduxComponent = require('../../reduxComponent')
const TabIcon = require('./tabIcon')

// State
const tabUIState = require('../../../../common/state/tabUIState')
const tabState = require('../../../../common/state/tabState')
const partitionState = require('../../../../common/state/tabContentState/partitionState')
const frameStateUtil = require('../../../../../js/state/frameStateUtil')

// Styles
const newSessionSvg = require('../../../../extensions/brave/img/tabs/new_session.svg')

class NewSessionIcon extends React.Component {
  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const frameKey = ownProps.frameKey
    const tabId = frameStateUtil.getTabIdByFrameKey(currentWindow, frameKey)
    const isPartition = partitionState.isPartitionTab(currentWindow, frameKey)

    const props = {}
    props.isPinned = tabState.isTabPinned(state, tabId)
    props.showPartitionIcon = tabUIState.showTabEndIcon(currentWindow, frameKey, isPartition)
    props.isActive = frameStateUtil.isFrameKeyActive(currentWindow, frameKey)
    props.textIsWhite = tabUIState.checkIfTextColor(currentWindow, frameKey, 'white')
    props.partitionNumber = partitionState.getMaxAllowedPartitionNumber(currentWindow, frameKey)

    return props
  }

  render () {
    if (this.props.isPinned || !this.props.showPartitionIcon) {
      return null
    }

    const newSession = StyleSheet.create({
      indicator: {
        filter: this.props.isActive && this.props.textIsWhite ? 'invert(100%)' : 'none'
      }
    })

    return <TabIcon symbol
      data-test-id='newSessionIcon'
      className={css(styles.newSession, newSession.indicator)}
      symbolContent={this.props.partitionNumber}
      l10nArgs={this.props.partitionNumber}
      l10nId='sessionInfoTab'
    />
  }
}

module.exports = ReduxComponent.connect(NewSessionIcon)

const styles = StyleSheet.create({
  newSession: {
    boxSizing: 'border-box',
    backgroundImage: `url(${newSessionSvg})`,
    backgroundSize: '15px',
    backgroundPosition: 'center left',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    width: '100%',
    height: '100%'
  }
})
