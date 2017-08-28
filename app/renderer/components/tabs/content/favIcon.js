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
const tabUIState = require('../../../../common/state/tabUIState')
const faviconState = require('../../../../common/state/tabContentState/faviconState')
const frameStateUtil = require('../../../../../js/state/frameStateUtil')

// Styles
const {filter, color, spacing} = require('../../styles/global')
const {spinKeyframes} = require('../../styles/animations')
const loadingIconSvg = require('../../../../extensions/brave/img/tabs/loading.svg')
const defaultIconSvg = require('../../../../extensions/brave/img/tabs/default.svg')

class Favicon extends React.Component {
  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const frameKey = ownProps.frameKey
    const tabId = frameStateUtil.getTabIdByFrameKey(currentWindow, frameKey)

    const props = {}
    props.isPinned = tabState.isTabPinned(state, tabId)
    props.tabLoading = faviconState.showLoadingIcon(currentWindow, frameKey)
    props.tabIconColor = tabUIState.getTabIconColor(currentWindow, frameKey)
    props.favicon = faviconState.getFavicon(currentWindow, frameKey)
    props.showIcon = faviconState.showFavicon(currentWindow, frameKey)
    props.showIconWithLessMargin = faviconState.showIconWithLessMargin(currentWindow, frameKey)
    props.showIconAtReducedSize = faviconState.showFaviconAtReducedSize(currentWindow, frameKey)

    return props
  }

  render () {
    if (!this.props.showIcon) {
      return null
    }

    const iconStyles = StyleSheet.create({
      favicon: {
        backgroundImage: `url(${this.props.favicon})`,
        filter: this.props.tabIconColor === 'white' ? filter.whiteShadow : 'none'
      },
      loadingIconColor: {
        filter: this.props.tabIconColor === 'white' ? filter.makeWhite : 'none'
      },
      defaultIconProps: {
        WebkitMaskSize: this.props.showIconAtReducedSize ? '10px' : '12px',
        backgroundColor: this.props.tabIconColor === 'white' ? color.white100 : color.mediumGray
      }
    })

    return <TabIcon
      data-test-favicon={this.props.favicon}
      data-test-id={this.props.tabLoading ? 'loading' : 'defaultIcon'}
      className={css(
        styles.icon,
        this.props.favicon && iconStyles.favicon,
        !this.props.isPinned && this.props.showIconWithLessMargin && styles.icon_lessMargin,
        !this.props.isPinned && this.props.showIconAtReducedSize && styles.icon_reducedSize
      )}
      symbol={
        this.props.tabLoading
          ? css(styles.loadingIcon, iconStyles.loadingIconColor)
          : !this.props.favicon && css(styles.defaultIcon, iconStyles.defaultIconProps)
      } />
  }
}

module.exports = ReduxComponent.connect(Favicon)

const styles = StyleSheet.create({
  icon: {
    position: 'relative',
    boxSizing: 'border-box',
    width: spacing.iconSize,
    height: spacing.iconSize,
    backgroundSize: spacing.iconSize,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignSelf: 'center',
    margin: spacing.defaultTabPadding
  },

  icon_lessMargin: {
    margin: 0
  },

  icon_reducedSize: {
    width: spacing.narrowIconSize,
    height: spacing.narrowIconSize,
    backgroundSize: spacing.narrowIconSize
  },

  loadingIcon: {
    position: 'absolute',
    left: 0,
    willChange: 'transform',
    backgroundImage: `url(${loadingIconSvg})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    animationName: spinKeyframes,
    animationTimingFunction: 'linear',
    animationDuration: '1200ms',
    animationIterationCount: 'infinite'
  },

  defaultIcon: {
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    WebkitMaskImage: `url(${defaultIconSvg})`
  }
})
