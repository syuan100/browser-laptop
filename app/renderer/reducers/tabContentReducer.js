/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const {makeImmutable} = require('../../common/state/immutableUtil')
const windowConstants = require('../../../js/constants/windowConstants')
const frameStateUtil = require('../../../js/state/frameStateUtil')
const tabState = require('../../common/state/tabState')

const tabContentReducer = (state, action, immutableAction) => {
  action = immutableAction || makeImmutable(action)
  switch (action.get('actionType')) {
    case windowConstants.WINDOW_SET_TAB_CONTENT_INTERSECTION_STATE:
      const isPinned = action.get('isPinned')
      const tabId = frameStateUtil.getActiveFrameTabId(state) || tabState.TAB_ID_NONE
      const frameKey = frameStateUtil.getFrameKeyByTabId(state, tabId)
      const activeTabPageIndex = frameStateUtil.getActiveTabPageIndex(state)
      const activeFrameTabPageIndex = frameStateUtil.getFrameTabPageIndex(state, tabId)
      const isActive = frameStateUtil.isFrameKeyActive(state, frameKey)

      // do not calculate intersection ratio for pinned tabs
      if (isPinned) {
        break
      }
      // all tabs in a tabSet share the same size so there's
      // no need to compute every tab intersection ratio,
      // so only listen for the active tab intersection state or
      // compute intersections when user is in a tab page
      // different than the active tab tabPage index (no visible active tab)
      if (isActive || activeTabPageIndex !== activeFrameTabPageIndex) {
        state = state.setIn(['ui', 'tabs', 'intersectionRatio'], action.get('ratio'))
        break
      }
      break
  }
  return state
}

module.exports = tabContentReducer
