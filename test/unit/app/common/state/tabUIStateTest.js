/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe, it, before, beforeEach, after */

const assert = require('assert')
const Immutable = require('immutable')
const mockery = require('mockery')
const fakeElectron = require('../../../lib/fakeElectron')
const {intersection} = require('../../../../../app/renderer/components/styles/global')

const frameKey = 1
const index = 0
let defaultState = Immutable.fromJS({
  activeFrameKey: frameKey,
  frames: [{
    key: frameKey,
    tabId: 1,
    location: 'http://brave.com'
  }],
  tabs: [{
    key: frameKey,
    index: index
  }],
  framesInternal: {
    index: { 1: 0 },
    tabIndex: { 1: 0 }
  }
})

describe('tabUIState unit tests', function () {
  let tabUIState
  let defaultValue

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })
    mockery.registerMock('electron', fakeElectron)
    mockery.registerMock('../../../js/settings', {
      getSetting: () => defaultValue
    })
    tabUIState = require('../../../../../app/common/state/tabUIState')
  })

  beforeEach(function () {
    defaultValue = true
  })

  after(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  describe('getThemeColor', function () {
    it('returns an empty string if frame is null/undefined', function * () {
      assert.equal(tabUIState.getThemeColor(), false)
    })

    it('returns the themeColor when PAINT_TABS is true', function * () {
      const state = defaultState.setIn(['frames', index, 'themeColor'], '#c0ff33')
      const result = tabUIState.getThemeColor(state, frameKey)
      assert.equal(result, '#c0ff33')
    })

    it('returns computedThemeColor when PAINT_TABS is true and themeColor is empty', function * () {
      const state = defaultState.mergeIn(['frames', index], {
        themeColor: '',
        computedThemeColor: 'saddlebrown'
      })
      const result = tabUIState.getThemeColor(state, frameKey)
      assert.equal(result, 'saddlebrown')
    })

    it('returns false when PAINT_TABS is false', function * () {
      defaultValue = false
      const state = defaultState.mergeIn(['frames', index], {
        themeColor: '#c0ff33',
        computedThemeColor: 'saddlebrown'
      })
      const result = tabUIState.getThemeColor(state, frameKey)
      assert.equal(result, false)
    })
  })

  describe('showTabEndIcon', function () {
    it('returns false if frame is null/undefined', function * () {
      assert.equal(tabUIState.showTabEndIcon(), false)
    })

    it('returns false for regular tabs', function () {
      const state = defaultState.mergeIn(['frames', index], {
        isPrivate: false,
        partitionNumber: null
      })
      const result = tabUIState.showTabEndIcon(state, frameKey, false)
      assert.equal(result, false)
    })

    describe('when tab is partitioned', function () {
      it('returns false if intersection is above 35% of tab size and has relative close icon', function * () {
        const state = defaultState
          .setIn(['frames', index, 'partitionNumber'], 1337)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.at75,
            hoverTabIndex: index
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns false if intersection is above 35% of tab size and has fixed close icon', function * () {
        const state = defaultState
          .setIn(['frames', index, 'partitionNumber'], 1337)
          .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at75)
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns false if intersection is below 35% of tab size', function * () {
        const state = defaultState
          .setIn(['frames', index, 'partitionNumber'], 1337)
          .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at35)
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns true if not hovering and intersection is above 35% of tab size', function * () {
        const state = defaultState
          .setIn(['frames', index, 'partitionNumber'], 1337)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.noIntersection,
            hoverTabIndex: 123123
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, true)
      })

      it('returns true if not active and intersection is above 35% of tab size', function * () {
        const state = defaultState
          .set('activeFrameKey', 1337)
          .setIn(['frames', index, 'partitionNumber'], 1337)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.noIntersection
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, true)
      })
    })

    describe('when tab is private', function () {
      it('returns false if intersection is above 35% of tab size and has relative close icon', function * () {
        const state = defaultState
          .setIn(['frames', index, 'isPrivate'], true)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.at75,
            hoverTabIndex: index
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns false if intersection is above 35% of tab size and has fixed close icon', function * () {
        const state = defaultState
          .setIn(['frames', index, 'isPrivate'], true)
          .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at75)
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns false if intersection is below 35% of tab size', function * () {
        const state = defaultState
          .setIn(['frames', index, 'isPrivate'], true)
          .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at35)
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, false)
      })

      it('returns true if not hovering and intersection is above 35% of tab size', function * () {
        const state = defaultState
          .setIn(['frames', index, 'isPrivate'], true)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.noIntersection,
            hoverTabIndex: 123123
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, true)
      })

      it('returns true if not active and intersection is above 35% of tab size', function * () {
        const state = defaultState
          .set('activeFrameKey', 1337)
          .setIn(['frames', index, 'isPrivate'], true)
          .mergeIn(['ui', 'tabs'], {
            intersectionRatio: intersection.noIntersection
          })
        const result = tabUIState.showTabEndIcon(state, frameKey)
        assert.equal(result, true)
      })
    })
  })

  describe('centerTabIdentity', function () {
    it('returns false if frame is null/undefined', function * () {
      assert.equal(tabUIState.centerTabIdentity(), false)
    })

    it('returns false if intersection is above 35% of tab size', function * () {
      const state = defaultState
        .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at45)
      const result = tabUIState.centerTabIdentity(state, frameKey)
      assert.equal(result, false)
    })

    it('returns false if tab is active', function * () {
      const state = defaultState
      const result = tabUIState.centerTabIdentity(state, frameKey)
      assert.equal(result, false)
    })

    it('returns true if tab is not active and intersection is below 35% of tab size', function * () {
      const state = defaultState
        .set('activeFrameKey', 1337)
        .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at35)
      const result = tabUIState.centerTabIdentity(state, frameKey)
      assert.equal(result, true)
    })
  })

  describe('centerEndIcons', function () {
    it('returns false if frame is null/undefined', function * () {
      assert.equal(tabUIState.centerEndIcons(), false)
    })

    it('returns false if intersection is above 35% of tab size', function * () {
      const state = defaultState
        .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at45)
      const result = tabUIState.centerEndIcons(state, frameKey)
      assert.equal(result, false)
    })
    it('returns false if tab is not active', function * () {
      const state = defaultState
        .set('activeFrameKey', 1337)
      const result = tabUIState.centerEndIcons(state, frameKey)
      assert.equal(result, false)
    })
    it('returns true if tab is active and intersection is below 35% of tab size', function * () {
      const state = defaultState
        .setIn(['ui', 'tabs', 'intersectionRatio'], intersection.at35)
      const result = tabUIState.centerEndIcons(state, frameKey)
      assert.equal(result, true)
    })
  })

  describe('titleHasExtraGutter', function () {
    it('returns false if frame is null/undefined', function * () {
      assert.equal(tabUIState.titleHasExtraGutter(), false)
    })
    it('returns true for about:newtab', function * () {
      const state = defaultState.setIn(['frames', index, 'location'], 'about:newtab')
      const result = tabUIState.titleHasExtraGutter(state, frameKey)
      assert.equal(result, true)
    })
    it('returns false for other locations', function * () {
      const state = defaultState.setIn(['frames', index, 'location'], 'whatelse.com')
      const result = tabUIState.titleHasExtraGutter(state, frameKey)
      assert.equal(result, false)
    })
  })
})
