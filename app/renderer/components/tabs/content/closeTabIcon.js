/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')

// Components
const ReduxComponent = require('../../reduxComponent')
const TabIcon = require('./tabIcon')

// State
const tabState = require('../../../../common/state/tabState')
const tabCloseState = require('../../../../common/state/tabContentState/tabCloseState')
const frameStateUtil = require('../../../../../js/state/frameStateUtil')

// Actions
const windowActions = require('../../../../../js/actions/windowActions')
const appActions = require('../../../../../js/actions/appActions')

// Styles
const {spacing} = require('../../styles/global')
const closeTabSvg = require('../../../../extensions/brave/img/tabs/close_btn.svg')

class CloseTabIcon extends React.Component {
  constructor (props) {
    super(props)
    this.onClick = this.onClick.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
  }

  onClick (event) {
    event.stopPropagation()
    if (this.props.hasFrame) {
      windowActions.onTabClosedWithMouse({
        fixTabWidth: this.props.fixTabWidth
      })
      appActions.tabCloseRequested(this.props.tabId)
    }
  }

  onDragStart (event) {
    event.preventDefault()
  }

  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const frameKey = ownProps.frameKey
    const tabId = frameStateUtil.getTabIdByFrameKey(currentWindow, frameKey)

    const props = {}
    props.isPinned = tabState.isTabPinned(state, tabId)
    props.fixTabWidth = ownProps.fixTabWidth
    props.hasFrame = frameStateUtil.hasFrame(currentWindow, frameKey)
    props.showCloseIcon = tabCloseState.showCloseTabIcon(currentWindow, frameKey)
    props.tabId = tabId

    return props
  }

  render () {
    if (this.props.isPinned || !this.props.showCloseIcon) {
      return null
    }

    return <TabIcon
      data-test-id='closeTabIcon'
      data-test2-id={this.props.showCloseIcon ? 'close-icon-on' : 'close-icon-off'}
      className={css(styles.closeTab)}
      l10nId='closeTabButton'
      onClick={this.onClick}
      onDragStart={this.onDragStart}
      draggable='true'
    />
  }
}

module.exports = ReduxComponent.connect(CloseTabIcon)

const styles = StyleSheet.create({
  closeTab: {
    boxSizing: 'border-box',
    backgroundImage: `url(${closeTabSvg})`,
    backgroundSize: spacing.closeIconSize,
    // mask icon to gray to avoid calling another icon on hover
    filter: 'invert(100%) grayscale(1) contrast(0.5) brightness(160%)',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    width: spacing.closeIconSize,
    height: spacing.closeIconSize,

    ':hover': {
      filter: 'none'
    }
  }
})
