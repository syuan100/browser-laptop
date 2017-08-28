/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')
const globalStyles = require('../styles/global')
const Immutable = require('immutable')

// Components
const ReduxComponent = require('../reduxComponent')
const Favicon = require('./content/favIcon')
const AudioTabIcon = require('./content/audioTabIcon')
const NewSessionIcon = require('./content/newSessionIcon')
const PrivateIcon = require('./content/privateIcon')
const TabTitle = require('./content/tabTitle')
const CloseTabIcon = require('./content/closeTabIcon')
const {NotificationBarCaret} = require('../main/notificationBar')

// Actions
const appActions = require('../../../../js/actions/appActions')
const windowActions = require('../../../../js/actions/windowActions')

// Store
const windowStore = require('../../../../js/stores/windowStore')

// State
const tabUIState = require('../../../common/state/tabUIState')
const partitionState = require('../../../common/state/tabContentState/partitionState')
const privateState = require('../../../common/state/tabContentState/privateState')
const audioState = require('../../../common/state/tabContentState/audioState')

const tabState = require('../../../common/state/tabState')

// Constants
const dragTypes = require('../../../../js/constants/dragTypes')

// Utils
const cx = require('../../../../js/lib/classSet')
const {getTextColorForBackground} = require('../../../../js/lib/color')
const {isIntermediateAboutPage} = require('../../../../js/lib/appUrlUtil')
const contextMenus = require('../../../../js/contextMenus')
const dnd = require('../../../../js/dnd')
const frameStateUtil = require('../../../../js/state/frameStateUtil')
const {hasTabAsRelatedTarget} = require('../../lib/tabUtil')
const isWindows = require('../../../common/lib/platformUtil').isWindows()
const {getCurrentWindowId} = require('../../currentWindow')
const UrlUtil = require('../../../../js/lib/urlutil')
const {setObserver} = require('../../lib/observerUtil')

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
    this.onObserve = this.onObserve.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragOver = this.onDragOver.bind(this)
    this.onClickTab = this.onClickTab.bind(this)
    this.tabNode = null
  }

  get frame () {
    return windowStore.getFrame(this.props.frameKey)
  }

  get draggingOverData () {
    const draggingOverData = this.props.dragData && this.props.dragData.get('dragOverData')
    if (!draggingOverData ||
        draggingOverData.get('draggingOverKey') !== this.props.frameKey ||
        draggingOverData.get('draggingOverWindowId') !== getCurrentWindowId()) {
      return
    }

    const sourceDragData = dnd.getInterBraveDragData()
    if (!sourceDragData) {
      return
    }
    const location = sourceDragData.get('location')
    const key = draggingOverData.get('draggingOverKey')
    const draggingOverFrame = windowStore.getFrame(key)
    if ((location === 'about:blank' || location === 'about:newtab' || isIntermediateAboutPage(location)) &&
        (draggingOverFrame && draggingOverFrame.get('pinnedLocation'))) {
      return
    }

    return draggingOverData
  }

  get isDragging () {
    const sourceDragData = dnd.getInterBraveDragData()
    return sourceDragData &&
      sourceDragData.get('key') === this.props.frameKey &&
      sourceDragData.get('draggingOverWindowId') === getCurrentWindowId()
  }

  get isDraggingOverSelf () {
    const draggingOverData = this.props.dragData && this.props.dragData.get('dragOverData')
    const sourceDragData = dnd.getInterBraveDragData()
    if (!draggingOverData || !sourceDragData) {
      return false
    }
    return draggingOverData.get('draggingOverKey') === sourceDragData.get('key')
  }

  get isDraggingOverLeft () {
    if (!this.draggingOverData) {
      return false
    }
    return this.draggingOverData.get('draggingOverLeftHalf')
  }

  get isDraggingOverRight () {
    if (!this.draggingOverData) {
      return false
    }
    return this.draggingOverData.get('draggingOverRightHalf')
  }

  onDragStart (e) {
    dnd.onDragStart(dragTypes.TAB, this.frame, e)
  }

  onDragEnd (e) {
    dnd.onDragEnd(dragTypes.TAB, this.frame, e)
  }

  onDragOver (e) {
    dnd.onDragOver(dragTypes.TAB, this.tabNode.getBoundingClientRect(), this.props.frameKey, this.draggingOverData, e)
  }

  onMouseLeave (e) {
    // mouseleave will keep the previewMode
    // as long as the related target is another tab
    windowActions.setTabHoverState(this.props.frameKey, false, hasTabAsRelatedTarget(e))
  }

  onMouseEnter (e) {
    // if mouse entered a tab we only trigger a new preview
    // if user is in previewMode, which is defined by mouse move
    windowActions.setTabHoverState(this.props.frameKey, true, this.props.previewMode)
  }

  onMouseMove () {
    // dispatch a message to the store so it can delay
    // and preview the tab based on mouse idle time
    windowActions.onTabMouseMove(this.props.frameKey)
  }

  onAuxClick (e) {
    this.onClickTab(e)
  }

  onTabClosedWithMouse (event) {
    event.stopPropagation()
    const frame = this.frame

    if (frame && !frame.isEmpty()) {
      const tabWidth = this.fixTabWidth
      windowActions.onTabClosedWithMouse({
        fixTabWidth: tabWidth
      })
      appActions.tabCloseRequested(this.props.tabId)
    }
  }

  onClickTab (e) {
    switch (e.button) {
      case 2:
        // Ignore right click
        return
      case 1:
        // Close tab with middle click
        // This is ignored for pinned tabs
        // TODO: @cezaraugusto remove conditional
        // when #4063 is resolved
        if (!this.props.isPinnedTab) {
          this.onTabClosedWithMouse(e)
        }
        break
      default:
        e.stopPropagation()
        appActions.tabActivateRequested(this.props.tabId)
    }
  }

  componentDidMount () {
    if (this.props.isPinned) {
      this.observer.unobserve(this.tabSentinel)
    }
    const threshold = Object.values(globalStyles.intersection)
    // At this moment Chrome can't handle unitless zeroes for rootMargin
    // see https://github.com/w3c/IntersectionObserver/issues/244
    const margin = '0px'
    this.tabNode.addEventListener('auxclick', this.onAuxClick.bind(this))

    this.observer = setObserver(this.tabSentinel, threshold, margin, this.onObserve)
    this.observer.observe(this.tabSentinel)
  }

  componentWillUnmount () {
    this.observer.unobserve(this.tabSentinel)
  }

  onObserve (entries) {
    // we only have one entry
    const entry = entries[0]
    windowActions.setTabIntersectionState(
      this.props.isPinnedTab,
      entry.intersectionRatio
    )
  }

  get fixTabWidth () {
    if (!this.tabNode) {
      return 0
    }

    const rect = this.tabNode.parentNode.getBoundingClientRect()
    return rect && rect.width
  }

  mergeProps (state, ownProps) {
    const currentWindow = state.get('currentWindow')
    const frame = frameStateUtil.getFrameByKey(currentWindow, ownProps.frameKey) || Immutable.Map()
    const frameKey = ownProps.frameKey
    const tabId = frame.get('tabId', tabState.TAB_ID_NONE)
    const isPinned = tabState.isTabPinned(state, tabId)

    // TODO notification checks should be stored in its own method
    const notifications = state.get('notifications')
    const notificationOrigins = notifications ? notifications.map(bar => bar.get('frameOrigin')) : false
    const notificationBarActive = frame.get('location') && notificationOrigins &&
      notificationOrigins.includes(UrlUtil.getUrlOrigin(frame.get('location')))

    const props = {}

    // TODO: migrate this
    props.notificationBarActive = notificationBarActive

    props.frameKey = ownProps.frameKey
    props.isPrivateTab = privateState.isPrivateTab(currentWindow, frameKey)
    props.isPartitionTab = partitionState.isPartitionTab(currentWindow, frameKey)
    props.isPinnedTab = isPinned
    props.isActive = frameStateUtil.isFrameKeyActive(currentWindow, frameKey)
    props.themeColor = tabUIState.getThemeColor(currentWindow, frameKey)
    props.tabWidth = currentWindow.getIn(['ui', 'tabs', 'fixTabWidth'])
    props.partOfFullPageSet = ownProps.partOfFullPageSet
    props.dragData = state.getIn(['dragData', 'type']) === dragTypes.TAB && state.get('dragData')
    props.tabId = tabId
    props.previewMode = currentWindow.getIn(['ui', 'tabs', 'previewMode'])
    props.title = frame.get('title')

    props.centerTabIdentity = tabUIState.centerTabIdentity(currentWindow, frameKey)
    props.centerEndIcons = tabUIState.centerEndIcons(currentWindow, frameKey)
    props.showAudioTopBorder = audioState.showAudioTopBorder(currentWindow, frameKey, isPinned)

    return props
  }

  render () {
    // we don't want themeColor if tab is private
    const perPageStyles = !this.props.isPrivateTab && StyleSheet.create({
      themeColor: {
        color: this.props.themeColor ? getTextColorForBackground(this.props.themeColor) : 'inherit',
        background: this.props.themeColor ? this.props.themeColor : 'inherit',
        ':hover': {
          color: this.props.themeColor ? getTextColorForBackground(this.props.themeColor) : 'inherit',
          background: this.props.themeColor ? this.props.themeColor : 'inherit'
        }
      },
      tab__endIcons: {
        backgroundImage: `linear-gradient(to left, ${this.props.themeColor}, transparent)`
      }
    })
    return <div
      data-tab-area
      className={cx({
        tabArea: true,
        draggingOverLeft: this.isDraggingOverLeft && !this.isDraggingOverSelf,
        draggingOverRight: this.isDraggingOverRight && !this.isDraggingOverSelf,
        isDragging: this.isDragging,
        isPinned: this.props.isPinnedTab,
        partOfFullPageSet: this.props.partOfFullPageSet || !!this.props.tabWidth
      })}
      style={this.props.tabWidth ? { flex: `0 0 ${this.props.tabWidth}px` } : {}}
      onMouseMove={this.onMouseMove}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}>
      {
        this.props.isActive && this.props.notificationBarActive
          ? <NotificationBarCaret />
          : null
      }
      <div
        data-tab
        ref={(node) => { this.tabNode = node }}
        className={css(
          styles.tab,
          // Windows specific style
          isWindows && styles.tab_forWindows,
          this.props.isPinnedTab && styles.isPinned,
          this.props.isActive && styles.active,
          this.props.showAudioTopBorder && styles.narrowViewPlayIndicator,
          this.props.isActive && this.props.themeColor && perPageStyles.themeColor,
          // Private color should override themeColor
          this.props.isPrivateTab && styles.private,
          this.props.isActive && this.props.isPrivateTab && styles.activePrivateTab
        )}
        data-test-id='tab'
        data-test-active-tab={this.props.isActive}
        data-test-pinned-tab={this.props.isPinnedTab}
        data-test-private-tab={this.props.isPrivateTab}
        data-frame-key={this.props.frameKey}
        draggable
        title={this.props.title}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onDragOver={this.onDragOver}
        onClick={this.onClickTab}
        onContextMenu={contextMenus.onTabContextMenu.bind(this, this.frame)}
      >
        {
          // Do not observe intersection for pinned tabs.
          !this.props.isPinned
          ? <div
            ref={(node) => { this.tabSentinel = node }}
            className={css(styles.tab__sentinel)}
          />
          : null
        }
        <div
          className={css(
            styles.tab__identity,
            this.props.centerTabIdentity && styles.tab__identity_centered
          )}>
          <Favicon frameKey={this.props.frameKey} />
          <AudioTabIcon frameKey={this.props.frameKey} />
          <TabTitle frameKey={this.props.frameKey} />
        </div>
        <div className={css(
          styles.tab__endIcons,
          perPageStyles.tab__endIcons,
          this.props.centerEndIcons && styles.tab__endIcons_centered
        )}>
          <PrivateIcon frameKey={this.props.frameKey} />
          <NewSessionIcon frameKey={this.props.frameKey} />
          <CloseTabIcon
            frameKey={this.props.frameKey}
            fixTabWidth={this.fixTabWidth}
          />
        </div>
      </div>
    </div>
  }
}

const styles = StyleSheet.create({
  // Windows specific style
  tab_forWindows: {
    color: '#555'
  },

  tab: {
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderWidth: '0 1px 0 0',
    borderStyle: 'solid',
    borderColor: '#bbb',
    color: globalStyles.color.tabTitle,
    display: 'flex',
    height: globalStyles.spacing.tabHeight,
    marginTop: '0',
    transition: `transform 200ms ease, ${globalStyles.transition.tabBackgroundTransition}`,
    left: '0',
    opacity: '1',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',

    ':hover': {
      background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(250, 250, 250, 0.4))'
    }
  },

  // The sentinel is responsible to respond to tabs
  // intersection state. This is an empty hidden element
  // which `width` value shouldn't be changed unless the intersection
  // point needs to be edited.
  tab__sentinel: {
    position: 'absolute',
    left: 0,
    height: '1px',
    background: 'transparent',
    width: globalStyles.spacing.sentinelSize
  },

  narrowViewPlayIndicator: {
    '::before': {
      zIndex: globalStyles.zindex.zindexTabsAudioTopBorder,
      content: `''`,
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'lightskyblue'
    }
  },

  isPinned: {
    paddingLeft: '2px',
    paddingRight: '2px'
  },

  active: {
    background: `rgba(255, 255, 255, 1.0)`,
    height: globalStyles.spacing.tabHeight,
    marginTop: '0',
    borderWidth: '0 1px 0 0',
    borderStyle: 'solid',
    borderColor: globalStyles.color.tabsToolbarBorderColor,
    color: '#000',

    ':hover': {
      background: `linear-gradient(to bottom, ${globalStyles.color.white100}, ${globalStyles.color.chromePrimary})`
    }
  },

  activePrivateTab: {
    background: globalStyles.color.privateTabBackgroundActive,
    color: globalStyles.color.white100,

    ':hover': {
      background: globalStyles.color.privateTabBackgroundActive
    }
  },

  private: {
    background: 'rgba(75, 60, 110, 0.2)',

    ':hover': {
      color: globalStyles.color.white100,
      background: globalStyles.color.privateTabBackgroundActive
    }
  },

  tab__identity: {
    boxSizing: 'border-box',
    display: 'flex',
    minWidth: 0 // see https://stackoverflow.com/a/36247448/4902448
  },

  tab__identity_centered: {
    boxSizing: 'border-box',
    flex: 1,
    flexDirection: 'column'
  },

  tab__endIcons: {
    boxSizing: 'border-box',
    backgroundImage: 'linear-gradient(to right, transparent 10%, rgba(255, 255, 255, 0.3) 90%)',
    position: 'absolute',
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    padding: globalStyles.spacing.defaultTabPadding,
    height: '100%',
    zIndex: globalStyles.zindex.zindexTabs,
    backgroundRepeat: 'no-repeat'
  },

  tab__endIcons_centered: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 0,
    margin: 'auto',
    width: '100%',
    height: '100%'
  }
})

module.exports = ReduxComponent.connect(Tab)
