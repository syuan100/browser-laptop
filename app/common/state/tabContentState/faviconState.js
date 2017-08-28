/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// Utils
const frameStateUtil = require('../../../../js/state/frameStateUtil')
const {isEntryIntersected} = require('../../../../app/renderer/lib/observerUtil')
const {isSourceAboutUrl} = require('../../../../js/lib/appUrlUtil')

// Styles
const {intersection} = require('../../../renderer/components/styles/global')

module.exports.showFavicon = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  const isNewTabPage = frame.get('location') === 'about:newtab'

  if (isEntryIntersected(state, 'tabs', intersection.at35)) {
    // when almost all tab content is covered,
    // only show favicon for the non-active tab
    return !frameStateUtil.isFrameKeyActive(state, frameKey)
  }

  // new tab page is the only tab we do not show favicon
  return !isNewTabPage
}

module.exports.getFavicon = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)
  const isLoadingVisible = module.exports.showLoadingIcon(state, frameKey)

  if (frame == null) {
    return ''
  }

  return !isLoadingVisible && frame.get('icon')
}

module.exports.showLoadingIcon = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    !isSourceAboutUrl(frame.get('location')) &&
    frame.get('loading')
  )
}

module.exports.showIconWithLessMargin = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return isEntryIntersected(state, 'tabs', intersection.at20)
}

module.exports.showFaviconAtReducedSize = (state, frameKey) => {
  const frame = frameStateUtil.getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return isEntryIntersected(state, 'tabs', intersection.at15)
}
