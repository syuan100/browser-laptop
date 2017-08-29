/* global describe, it, before, after */
const mockery = require('mockery')
const Immutable = require('immutable')
// const assert = require('assert')
const fakeElectron = require('../../../lib/fakeElectron')

// const windowConstants = require('../../../../../js/constants/windowConstants')
require('../../../braveUnit')

describe('tabContentReducer', function () {
  let tabContentReducer
  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    })
    mockery.registerMock('electron', fakeElectron)
    tabContentReducer = require('../../../../../app/renderer/reducers/tabContentReducer')
  })

  after(function () {
    mockery.disable()
  })

  describe('WINDOW_SET_TAB_CONTENT_INTERSECTION_STATE', function () {
    before(function () {
      this.newState = tabContentReducer(Immutable.Map({}), {
        // actionType: windowConstants.WINDOW_SET_TAB_CONTENT_INTERSECTION_STATE
      })
    })
    it('Does not modify state', function () {
      // TODO
      // assert()
    })
  })
})
