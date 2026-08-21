;(function () {
  'use strict'

  var CHECKER_SELECTOR = '[data-module="app-liveness-checker"]'
  var DEFAULT_STATE = 'searching'
  var VALID_STATES = ['searching', 'detected', 'error']
  var DEFAULT_MAX_OUTPUT_WIDTH = 900
  var DEFAULT_JPEG_QUALITY = 0.78

  window.livenessCheckers = window.livenessCheckers || {}

  function normaliseId(value) {
    return (
      String(value || 'liveness-checker')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'liveness-checker'
    )
  }

  function ensureMediaDevicesCompatibility() {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {}
    }

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = function (constraints) {
        var getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
        }

        return new Promise(function (resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject)
        })
      }
    }
  }

  function createCustomEvent(name, detail) {
    if (typeof window.CustomEvent === 'function') {
      return new CustomEvent(name, {
        bubbles: true,
        detail: detail,
      })
    }

    var event = document.createEvent('CustomEvent')
    event.initCustomEvent(name, true, false, detail)
    return event
  }

  function elementContains(parent, child) {
    return parent === child || parent.contains(child)
  }

  function findClosestForm(element) {
    if (element.closest) {
      return element.closest('form')
    }

    while (element && element.nodeType === 1) {
      if (element.tagName.toLowerCase() === 'form') {
        return element
      }

      element = element.parentNode
    }

    return null
  }

  function showElement(element) {
    if (!element) {
      return
    }

    element.hidden = false
    element.removeAttribute('hidden')
    element.classList.remove('govuk-!-display-none')
    element.classList.remove('app-hidden')

    if (window.getComputedStyle(element).display === 'none') {
      element.style.display = 'block'
    }
  }

  function hideElement(element) {
    if (!element) {
      return
    }

    element.hidden = true
  }

  function getInputFormId(input) {
    return input ? input.getAttribute('form') || '' : ''
  }

  function LivenessChecker(wrapper) {
    this.wrapper = wrapper
    this.id = normaliseId(wrapper.getAttribute('data-scanner-id'))
    this.fieldName = wrapper.getAttribute('data-field-name')
    this.formId = wrapper.getAttribute('data-form-id') || ''
    this.errorSummaryId = wrapper.getAttribute('data-error-summary-id') || ''

    this.guideWidthRatio = 0.62
    this.guideHeightRatio = 0.76

    this.captureOnSubmit = wrapper.getAttribute('data-capture-on-submit') !== 'false'
    this.revealFormOnCameraReady =
      wrapper.getAttribute('data-reveal-form-on-camera-ready') !== 'false'

    this.form = this.formId ? document.getElementById(this.formId) : findClosestForm(wrapper)
    this.cameraPanel = wrapper.querySelector('.app-liveness-checker')
    this.video = wrapper.querySelector('.app-liveness-checker__video')
    this.canvas = wrapper.querySelector('.app-liveness-checker__canvas')
    this.input = wrapper.querySelector('.app-liveness-checker__input')

    this.permissionWarning = this.errorSummaryId
      ? document.getElementById(this.errorSummaryId)
      : wrapper.querySelector('.app-liveness-checker__permissions-warning')

    this.displayUntilCameraReady = wrapper.querySelector(
      '.app-liveness-checker__until-camera-permission',
    )

    this.status = wrapper.querySelector('.app-liveness-checker__status')
    this.scanWindow = wrapper.querySelector('.app-liveness-checker__window')
    this.overlay = wrapper.querySelector('.app-liveness-checker__overlay')
    this.overlayPath = wrapper.querySelector('.app-liveness-checker__overlay-path')

    this.guidePathTop = wrapper.querySelector('.app-liveness-checker__guide-path--top')
    this.guidePathRight = wrapper.querySelector('.app-liveness-checker__guide-path--right')
    this.guidePathBottom = wrapper.querySelector('.app-liveness-checker__guide-path--bottom')
    this.guidePathLeft = wrapper.querySelector('.app-liveness-checker__guide-path--left')

    this.stream = null
    this.resizeObserver = null
    this.state = DEFAULT_STATE
    this.isReady = false
    this.guide = null

    this.onLoadedMetadata = this.onLoadedMetadata.bind(this)
    this.updateGuideGeometry = this.updateGuideGeometry.bind(this)
  }

  LivenessChecker.prototype.init = function () {
    if (
      !this.video ||
      !this.canvas ||
      !this.input ||
      !this.scanWindow ||
      !this.overlay ||
      !this.overlayPath ||
      !this.guidePathTop ||
      !this.guidePathRight ||
      !this.guidePathBottom ||
      !this.guidePathLeft ||
      !this.cameraPanel
    ) {
      return
    }

    this.input.setAttribute('name', this.fieldName)
    this.setState(DEFAULT_STATE)
    this.bindEvents()
    this.observeResize()
    this.updateGuideGeometry()
    this.startCamera()
  }

  LivenessChecker.prototype.bindEvents = function () {
    this.video.addEventListener('loadedmetadata', this.onLoadedMetadata)
    window.addEventListener('resize', this.updateGuideGeometry)
  }

  LivenessChecker.prototype.observeResize = function () {
    if (typeof ResizeObserver !== 'function') {
      return
    }

    this.resizeObserver = new ResizeObserver(this.updateGuideGeometry)
    this.resizeObserver.observe(this.cameraPanel)
  }

  LivenessChecker.prototype.updateGuideGeometry = function () {
    var rect = this.cameraPanel.getBoundingClientRect()

    var containerWidth = rect.width
    var containerHeight = rect.height

    if (!containerWidth || !containerHeight) {
      return
    }

    var guideWidth = containerWidth * this.guideWidthRatio
    var guideHeight = containerHeight * this.guideHeightRatio

    var left = (containerWidth - guideWidth) / 2
    var top = (containerHeight - guideHeight) / 2

    var cx = containerWidth / 2
    var cy = containerHeight / 2
    var rx = guideWidth / 2
    var ry = guideHeight / 2

    this.guide = {
      left: left,
      top: top,
      width: guideWidth,
      height: guideHeight,
      right: left + guideWidth,
      bottom: top + guideHeight,
    }

    this.overlay.setAttribute('viewBox', '0 0 ' + containerWidth + ' ' + containerHeight)

    this.overlayPath.setAttribute(
      'd',
      this.getOverlayPath(containerWidth, containerHeight, guideWidth, guideHeight),
    )

    this.guidePathTop.setAttribute('d', this.getEllipseArcPath(cx, cy, rx, ry, -125, -55))

    this.guidePathRight.setAttribute('d', this.getEllipseArcPath(cx, cy, rx, ry, -25, 25))

    this.guidePathBottom.setAttribute('d', this.getEllipseArcPath(cx, cy, rx, ry, 55, 125))

    this.guidePathLeft.setAttribute('d', this.getEllipseArcPath(cx, cy, rx, ry, 155, 205))

    this.wrapper.dispatchEvent(
      createCustomEvent('liveness-checker:resize', {
        id: this.id,
        fieldName: this.fieldName,
        guide: this.guide,
      }),
    )
  }

  LivenessChecker.prototype.getOverlayPath = function (
    containerWidth,
    containerHeight,
    guideWidth,
    guideHeight,
  ) {
    var cx = containerWidth / 2
    var cy = containerHeight / 2

    var rx = guideWidth / 2
    var ry = guideHeight / 2

    return [
      'M0 0',
      'H' + containerWidth,
      'V' + containerHeight,
      'H0',
      'Z',

      'M' + (cx - rx) + ' ' + cy,

      'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx + rx) + ' ' + cy,
      'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx - rx) + ' ' + cy,
      'Z',
    ].join(' ')
  }

  LivenessChecker.prototype.getEllipseArcPath = function (cx, cy, rx, ry, startAngle, endAngle) {
    var startRadians = (Math.PI / 180) * startAngle
    var endRadians = (Math.PI / 180) * endAngle

    var startX = cx + rx * Math.cos(startRadians)
    var startY = cy + ry * Math.sin(startRadians)

    var endX = cx + rx * Math.cos(endRadians)
    var endY = cy + ry * Math.sin(endRadians)

    var largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
    var sweepFlag = 1

    return [
      'M' + startX + ' ' + startY,
      'A' + rx + ' ' + ry + ' 0 ' + largeArcFlag + ' ' + sweepFlag + ' ' + endX + ' ' + endY,
    ].join(' ')
  }

  LivenessChecker.prototype.startCamera = function () {
    var checker = this

    ensureMediaDevicesCompatibility()

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: {
            ideal: 'user',
          },
        },
        audio: false,
      })
      .then(function (stream) {
        checker.onMediaStream(stream)
      })
      .catch(function (error) {
        checker.onMediaError(error)
      })
  }

  LivenessChecker.prototype.onMediaStream = function (stream) {
    this.stream = stream
    this.attachStreamToVideo()

    this.wrapper.classList.add('app-liveness-checker-wrapper--camera-ready')
    this.wrapper.classList.remove('app-liveness-checker-wrapper--camera-error')

    if (this.revealFormOnCameraReady && this.form) {
      showElement(this.form)
    }

    hideElement(this.displayUntilCameraReady)
    this.hidePermissionWarning()

    var checker = this

    window.setTimeout(function () {
      checker.playVideo()
      checker.updateGuideGeometry()
    }, 0)
  }

  LivenessChecker.prototype.onMediaError = function (error) {
    var message = 'We could not access your camera. Check your browser permissions and try again.'

    if (error && error.name === 'NotAllowedError') {
      message = 'Camera access was denied. Allow camera access and try again.'
    } else if (error && error.name === 'NotFoundError') {
      message = 'No camera could be found on this device.'
    } else if (error && error.name === 'NotReadableError') {
      message = 'Your camera is currently being used by another application.'
    } else if (error && error.name === 'SecurityError') {
      message = 'Your browser security settings are preventing access to the camera.'
    }

    this.wrapper.classList.add('app-liveness-checker-wrapper--camera-error')
    this.showPermissionWarning(message)
    this.setState('error')
  }

  LivenessChecker.prototype.onLoadedMetadata = function () {
    this.canvas.width = this.video.videoWidth
    this.canvas.height = this.video.videoHeight

    this.video.setAttribute('width', this.video.videoWidth)
    this.video.setAttribute('height', this.video.videoHeight)
    this.canvas.setAttribute('width', this.video.videoWidth)
    this.canvas.setAttribute('height', this.video.videoHeight)

    this.isReady = true
    this.playVideo()
  }

  LivenessChecker.prototype.hasLiveStream = function () {
    if (!this.stream) {
      return false
    }

    return this.stream.getVideoTracks().some(function (track) {
      return track.readyState === 'live'
    })
  }

  LivenessChecker.prototype.attachStreamToVideo = function () {
    if (!this.stream || !this.video) {
      return
    }

    if ('srcObject' in this.video) {
      this.video.srcObject = null
      this.video.srcObject = this.stream
    } else {
      this.video.removeAttribute('src')
      this.video.src = window.URL.createObjectURL(this.stream)
    }

    this.video.muted = true
    this.video.autoplay = true
    this.video.playsInline = true
    this.video.setAttribute('muted', '')
    this.video.setAttribute('autoplay', '')
    this.video.setAttribute('playsinline', '')
    this.video.setAttribute('webkit-playsinline', '')
  }

  LivenessChecker.prototype.playVideo = function () {
    var checker = this

    if (!this.video || typeof this.video.play !== 'function') {
      return
    }

    var playPromise = this.video.play()

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (!checker.hasLiveStream()) {
          checker.showPermissionWarning(
            'The camera preview could not be restarted. Refresh the page and allow camera access.',
          )
        }
      })
    }
  }

  LivenessChecker.prototype.resumeOrRestartCamera = function () {
    var checker = this

    if (this.hasLiveStream()) {
      this.attachStreamToVideo()

      window.setTimeout(function () {
        checker.playVideo()
        checker.updateGuideGeometry()
      }, 0)

      return
    }

    this.isReady = false
    this.startCamera()
  }

  LivenessChecker.prototype.capture = function () {
    if (!this.isReady || !this.video.videoWidth || !this.video.videoHeight) {
      this.showPermissionWarning('The camera is not ready yet. Try again in a moment.')
      return ''
    }

    var image = this.captureGuideArea()

    if (!image) {
      return ''
    }

    this.input.value = image

    this.wrapper.dispatchEvent(
      createCustomEvent('liveness-checker:capture', {
        id: this.id,
        fieldName: this.fieldName,
        image: image,
      }),
    )

    return image
  }

  LivenessChecker.prototype.captureGuideArea = function () {
    if (!this.guide) {
      this.updateGuideGeometry()
    }

    if (!this.guide) {
      this.showPermissionWarning('The camera is not ready yet. Try again in a moment.')
      return ''
    }

    var guide = this.guide
    var panelRect = this.cameraPanel.getBoundingClientRect()
    var panelWidth = panelRect.width
    var panelHeight = panelRect.height
    var videoWidth = this.video.videoWidth
    var videoHeight = this.video.videoHeight
    var scale = Math.max(panelWidth / videoWidth, panelHeight / videoHeight)
    var renderedVideoWidth = videoWidth * scale
    var renderedVideoHeight = videoHeight * scale
    var renderedVideoLeft = (panelWidth - renderedVideoWidth) / 2
    var renderedVideoTop = (panelHeight - renderedVideoHeight) / 2
    var sourceX = (guide.left - renderedVideoLeft) / scale
    var sourceY = (guide.top - renderedVideoTop) / scale
    var sourceWidth = guide.width / scale
    var sourceHeight = guide.height / scale

    sourceX = Math.max(0, Math.min(videoWidth, sourceX))
    sourceY = Math.max(0, Math.min(videoHeight, sourceY))
    sourceWidth = Math.max(1, Math.min(videoWidth - sourceX, sourceWidth))
    sourceHeight = Math.max(1, Math.min(videoHeight - sourceY, sourceHeight))

    var outputWidth = Math.min(DEFAULT_MAX_OUTPUT_WIDTH, Math.round(sourceWidth))
    var outputHeight = Math.round(sourceHeight * (outputWidth / sourceWidth))

    this.canvas.width = outputWidth
    this.canvas.height = outputHeight

    var context = this.canvas.getContext('2d')

    context.drawImage(
      this.video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    )

    return this.canvas.toDataURL('image/jpeg', DEFAULT_JPEG_QUALITY)
  }

  LivenessChecker.prototype.clear = function () {
    this.input.value = ''

    var context = this.canvas.getContext('2d')
    context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.wrapper.dispatchEvent(
      createCustomEvent('liveness-checker:clear', {
        id: this.id,
        fieldName: this.fieldName,
      }),
    )
  }

  LivenessChecker.prototype.getImage = function () {
    return this.input.value
  }

  LivenessChecker.prototype.setDetected = function (isDetected) {
    this.setState(isDetected ? 'detected' : 'searching')
  }

  LivenessChecker.prototype.setState = function (state) {
    if (VALID_STATES.indexOf(state) === -1) {
      state = DEFAULT_STATE
    }

    this.scanWindow.classList.remove(
      'app-liveness-checker__window--searching',
      'app-liveness-checker__window--detected',
      'app-liveness-checker__window--error',
    )

    this.scanWindow.classList.add('app-liveness-checker__window--' + state)
    this.wrapper.setAttribute('data-state', state)
    this.state = state

    if (this.status) {
      this.status.textContent = this.getStatusText(state)
    }
  }

  LivenessChecker.prototype.getStatusText = function (state) {
    if (state === 'detected') {
      return 'Face detected.'
    }

    if (state === 'error') {
      return 'There is a problem with the camera.'
    }

    return 'Position your face inside the oval.'
  }

  LivenessChecker.prototype.showPermissionWarning = function (message) {
    if (!this.permissionWarning) {
      return
    }

    var errorLink = this.permissionWarning.querySelector('.govuk-error-summary__list a')

    var errorListItem = this.permissionWarning.querySelector('.govuk-error-summary__list li')

    if (errorLink) {
      errorLink.textContent = message
    } else if (errorListItem) {
      errorListItem.textContent = message
    } else {
      this.permissionWarning.textContent = message
    }

    this.permissionWarning.hidden = false
    this.permissionWarning.removeAttribute('hidden')

    if (typeof this.permissionWarning.focus === 'function') {
      this.permissionWarning.focus()
    }
  }

  LivenessChecker.prototype.hidePermissionWarning = function () {
    if (!this.permissionWarning) {
      return
    }

    this.permissionWarning.hidden = true
  }

  LivenessChecker.prototype.stop = function () {
    if (!this.stream) {
      return
    }

    this.stream.getTracks().forEach(function (track) {
      track.stop()
    })

    this.stream = null
  }

  function initialiseLivenessCheckers() {
    var wrappers = document.querySelectorAll(CHECKER_SELECTOR)

    Array.prototype.forEach.call(wrappers, function (wrapper, index) {
      if (wrapper.getAttribute('data-liveness-checker-initialised') === 'true') {
        return
      }

      var checker = new LivenessChecker(wrapper)
      var registryId = checker.id || 'checker-' + index

      wrapper.setAttribute('data-liveness-checker-initialised', 'true')
      window.livenessCheckers[registryId] = checker

      checker.init()
    })
  }

  function checkerBelongsToForm(checker, wrapper, form) {
    if (elementContains(form, wrapper)) {
      return true
    }

    if (checker.formId && form.id && checker.formId === form.id) {
      return true
    }

    return false
  }

  function checkerInputBelongsToForm(checker, form) {
    if (elementContains(form, checker.input)) {
      return true
    }

    if (form.id && getInputFormId(checker.input) === form.id) {
      return true
    }

    return false
  }

  function captureCheckersInForm(event) {
    var form = event.target

    if (!form || form.tagName.toLowerCase() !== 'form') {
      return
    }

    var wrappers = document.querySelectorAll(CHECKER_SELECTOR)
    var failed = false

    Array.prototype.forEach.call(wrappers, function (wrapper) {
      var id = normaliseId(wrapper.getAttribute('data-scanner-id'))
      var checker = window.livenessCheckers[id]

      if (!checker || !checker.captureOnSubmit) {
        return
      }

      if (!checkerBelongsToForm(checker, wrapper, form)) {
        return
      }

      if (!checkerInputBelongsToForm(checker, form)) {
        failed = true
        checker.showPermissionWarning(
          'The liveness checker field is not associated with the form. Check the form id or the formId parameter.',
        )
        return
      }

      var image = checker.capture()

      if (!image) {
        failed = true
      }
    })

    if (failed) {
      event.preventDefault()
    }
  }

  function resumeCheckersAfterPageShow() {
    if (!window.livenessCheckers) {
      return
    }

    Object.keys(window.livenessCheckers).forEach(function (id) {
      var checker = window.livenessCheckers[id]

      if (checker && typeof checker.resumeOrRestartCamera === 'function') {
        checker.resumeOrRestartCamera()
      }
    })
  }

  if (!window.__appLivenessCheckerSubmitListenerAdded) {
    document.addEventListener('submit', captureCheckersInForm, true)
    window.__appLivenessCheckerSubmitListenerAdded = true
  }

  if (!window.__appLivenessCheckerPageShowListenerAdded) {
    window.addEventListener('pageshow', function () {
      resumeCheckersAfterPageShow()
    })

    window.__appLivenessCheckerPageShowListenerAdded = true
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseLivenessCheckers)
  } else {
    initialiseLivenessCheckers()
  }

  window.LivenessChecker = LivenessChecker
  window.initLivenessCheckers = initialiseLivenessCheckers
})()
