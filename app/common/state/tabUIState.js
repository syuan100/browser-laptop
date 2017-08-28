/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// Constants
const settings = require('../../../js/constants/settings')

// state
const frameStateUtil = require('../../../js/state/frameStateUtil')
const tabCloseState = require('../../common/state/tabContentState/tabCloseState')

// Utis
const {isEntryIntersected} = require('../../../app/renderer/lib/observerUtil')
const {getTextColorForBackground} = require('../../../js/lib/color')

// settings
const {getSetting} = require('../../../js/settings')

// Styles
const {intersection, color} = require('../../renderer/components/styles/global')

module.exports.getThemeColor = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    getSetting(settings.PAINT_TABS) &&
    (frame.get('themeColor') || frame.get('computedThemeColor'))
  )
}

module.exports.getTabIconColor = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)
  const isActive = frameStateUtil.isFrameKeyActive(state, frameKey)
  const hoverState = frameStateUtil.getTabHoverState(state, frameKey)

  if (frame == null) {
    return ''
  }

  const themeColor = frame.get('themeColor') || frame.get('computedThemeColor')
  const activeNonPrivateTab = !frame.get('isPrivate') && isActive
  const isPrivateTab = frame.get('isPrivate') && (isActive || hoverState)
  const defaultColor = isPrivateTab ? color.white100 : color.black100
  const isPaintTabs = getSetting(settings.PAINT_TABS)

  return activeNonPrivateTab && isPaintTabs && !!themeColor
    ? getTextColorForBackground(themeColor)
    : defaultColor
}

module.exports.checkIfTextColor = (state, frameKey, color) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return module.exports.getTabIconColor(state, frameKey) === color
}

/**
 * Check whether or not private or newSession icon should be visible
 */
module.exports.showTabEndIcon = (state, frameKey, sessionType) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    sessionType &&
    !isEntryIntersected(state, 'tabs', intersection.at35) &&
    !tabCloseState.hasRelativeCloseIcon(state, frameKey) &&
    !tabCloseState.hasFixedCloseIcon(state, frameKey)
  )
}

module.exports.centerTabIdentity = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    isEntryIntersected(state, 'tabs', intersection.at35) &&
    !frameStateUtil.isFrameKeyActive(state, frameKey)
  )
}

module.exports.centerEndIcons = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    isEntryIntersected(state, 'tabs', intersection.at35) &&
    frameStateUtil.isFrameKeyActive(state, frameKey)
  )
}

module.exports.titleHasExtraGutter = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return frame.get('location') === 'about:newtab'
}

// TODO
// ++ getTabBackgroundColor
// ++ getTabEndGradientColor
