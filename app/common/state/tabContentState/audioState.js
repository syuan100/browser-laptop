/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

// Utils
const {isEntryIntersected} = require('../../../../app/renderer/lib/observerUtil')
const {getFrameByKey} = require('../../../../js/state/frameStateUtil')

module.exports.canPlayAudio = (state, frameKey) => {
  const frame = getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return frame.get('audioPlaybackActive') || frame.get('audioMuted')
}

module.exports.isAudioMuted = (state, frameKey) => {
  const frame = getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  const tabCanPlayAudio = module.exports.canPlayAudio(state, frameKey)
  return tabCanPlayAudio && frame.get('audioMuted')
}

module.exports.showAudioIcon = (state, frameKey) => {
  const frame = getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    !isEntryIntersected(state, 'tabs') &&
    module.exports.canPlayAudio(state, frameKey)
  )
}

module.exports.showAudioTopBorder = (state, frameKey, isPinned) => {
  const frame = getFrameByKey(state, frameKey)

  if (frame == null) {
    return false
  }

  return (
    module.exports.canPlayAudio(state, frameKey) &&
    (isEntryIntersected(state, 'tabs') || isPinned)
  )
}
