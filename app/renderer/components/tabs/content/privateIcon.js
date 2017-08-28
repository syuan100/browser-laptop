/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')

// Components
const ReduxComponent = require('../../reduxComponent')
const TabIcon = require('./tabIcon')

// State
const frameStateUtil = require('../../../../../js/state/frameStateUtil')
const tabUIState = require('../../../../common/state/tabUIState')
const tabState = require('../../../../common/state/tabState')
const privateState = require('../../../../common/state/tabContentState/privateState')

// Styles
const globalStyles = require('../../styles/global')
const privateSvg = require('../../../../extensions/brave/img/tabs/private.svg')

class PrivateIcon extends React.Component {
  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const frameKey = ownProps.frameKey
    const tabId = frameStateUtil.getTabIdByFrameKey(currentWindow, frameKey)
    const isPrivate = privateState.isPrivateTab(currentWindow, frameKey)

    const props = {}
    props.isPinned = tabState.isTabPinned(state, tabId)
    props.isActive = frameStateUtil.isFrameKeyActive(currentWindow, frameKey)
    props.showPrivateIcon = tabUIState.showTabEndIcon(currentWindow, frameKey, isPrivate)

    return props
  }

  render () {
    if (this.props.isPinned || !this.props.showPrivateIcon) {
      return null
    }

    const privateStyles = StyleSheet.create({
      icon: {
        backgroundColor: this.props.isActive
          ? globalStyles.color.white100
          : globalStyles.color.black100
      }
    })

    return <TabIcon
      data-test-id='privateIcon'
      className={css(styles.secondaryIcon, privateStyles.icon)}
    />
  }
}

module.exports = ReduxComponent.connect(PrivateIcon)

const styles = StyleSheet.create({
  secondaryIcon: {
    boxSizing: 'border-box',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskImage: `url(${privateSvg})`,
    WebkitMaskSize: '15px',
    width: '100%',
    height: '100%'
  }
})
