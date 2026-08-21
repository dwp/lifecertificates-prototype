;(function () {
  'use strict'

  var SCANNER_SELECTOR = '[data-module="app-document-scanner"]'
  var DEFAULT_STATE = 'searching'
  var VALID_STATES = ['searching', 'detected', 'error']
  var DEFAULT_CARD_RATIO = 1.586
  var DEFAULT_MAX_WIDTH_RATIO = 0.8
  var DEFAULT_MAX_HEIGHT_RATIO = 0.5
  var DEFAULT_RADIUS = 24
  var DEFAULT_MAX_OUTPUT_WIDTH = 900
  var DEFAULT_JPEG_QUALITY = 0.78

  window.documentScanners = window.documentScanners || {}

  function normaliseId(value) {
    return (
      String(value || 'document-scanner')
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'document-scanner'
    )
  }

  function toNumber(value, fallback) {
    var number = parseFloat(value)
    return isNaN(number) ? fallback : number
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

  function DocumentScanner(wrapper) {
    this.wrapper = wrapper
    this.id = normaliseId(wrapper.getAttribute('data-scanner-id'))
    this.fieldName = wrapper.getAttribute('data-field-name')
    this.side = wrapper.getAttribute('data-side') || 'front'
    this.formId = wrapper.getAttribute('data-form-id') || ''
    this.cardRatio = toNumber(wrapper.getAttribute('data-card-ratio'), DEFAULT_CARD_RATIO)
    this.maxWidthRatio = toNumber(
      wrapper.getAttribute('data-guide-max-width'),
      DEFAULT_MAX_WIDTH_RATIO,
    )
    this.maxHeightRatio = toNumber(
      wrapper.getAttribute('data-guide-max-height'),
      DEFAULT_MAX_HEIGHT_RATIO,
    )
    this.captureOnSubmit = wrapper.getAttribute('data-capture-on-submit') !== 'false'
    this.revealFormOnCameraReady =
      wrapper.getAttribute('data-reveal-form-on-camera-ready') !== 'false'

    this.form = this.formId ? document.getElementById(this.formId) : findClosestForm(wrapper)
    this.cameraPanel = wrapper.querySelector('.app-document-scanner')
    this.video = wrapper.querySelector('.app-document-scanner__video')
    this.canvas = wrapper.querySelector('.app-document-scanner__canvas')
    this.input = wrapper.querySelector('.app-document-scanner__input')
    this.errorSummaryId = wrapper.getAttribute('data-error-summary-id') || ''
    this.permissionWarning = this.errorSummaryId
      ? document.getElementById(this.errorSummaryId)
      : wrapper.querySelector('.app-document-scanner__permissions-warning')

    this.displayUntilCameraReady = wrapper.querySelector(
      '.app-document-scanner__until-camera-permission',
    )
    this.status = wrapper.querySelector('.app-document-scanner__status')
    this.scanWindow = wrapper.querySelector('.app-document-scanner__window')
    this.overlay = wrapper.querySelector('.app-document-scanner__overlay')
    this.overlayPath = wrapper.querySelector('.app-document-scanner__overlay-path')

    this.stream = null
    this.resizeObserver = null
    this.state = DEFAULT_STATE
    this.isReady = false
    this.guide = null

    this.onLoadedMetadata = this.onLoadedMetadata.bind(this)
    this.updateGuideGeometry = this.updateGuideGeometry.bind(this)
  }

  DocumentScanner.prototype.init = function () {
    if (
      !this.video ||
      !this.canvas ||
      !this.input ||
      !this.scanWindow ||
      !this.overlay ||
      !this.overlayPath ||
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

  DocumentScanner.prototype.bindEvents = function () {
    this.video.addEventListener('loadedmetadata', this.onLoadedMetadata)
    window.addEventListener('resize', this.updateGuideGeometry)
  }

  DocumentScanner.prototype.observeResize = function () {
    if (typeof ResizeObserver !== 'function') {
      return
    }

    this.resizeObserver = new ResizeObserver(this.updateGuideGeometry)
    this.resizeObserver.observe(this.cameraPanel)
  }

  DocumentScanner.prototype.updateGuideGeometry = function () {
    var rect = this.cameraPanel.getBoundingClientRect()
    var containerWidth = rect.width
    var containerHeight = rect.height

    if (!containerWidth || !containerHeight) {
      return
    }

    var maxWindowWidth = containerWidth * this.maxWidthRatio
    var maxWindowHeight = containerHeight * this.maxHeightRatio
    var windowWidth = Math.min(maxWindowWidth, maxWindowHeight * this.cardRatio)
    var windowHeight = windowWidth / this.cardRatio
    var left = (containerWidth - windowWidth) / 2
    var top = (containerHeight - windowHeight) / 2
    var right = left + windowWidth
    var bottom = top + windowHeight
    var radius = Math.min(DEFAULT_RADIUS, windowHeight * 0.12)

    this.guide = {
      left: left,
      top: top,
      width: windowWidth,
      height: windowHeight,
      right: right,
      bottom: bottom,
      radius: radius,
    }

    this.cameraPanel.style.setProperty('--scanner-window-left', left + 'px')
    this.cameraPanel.style.setProperty('--scanner-window-top', top + 'px')
    this.cameraPanel.style.setProperty('--scanner-window-width', windowWidth + 'px')
    this.cameraPanel.style.setProperty('--scanner-window-height', windowHeight + 'px')
    this.cameraPanel.style.setProperty('--scanner-window-radius', radius + 'px')

    this.overlay.setAttribute('viewBox', '0 0 ' + containerWidth + ' ' + containerHeight)
    this.overlayPath.setAttribute(
      'd',
      this.getOverlayPath(containerWidth, containerHeight, left, top, right, bottom, radius),
    )

    this.wrapper.dispatchEvent(
      createCustomEvent('document-scanner:resize', {
        id: this.id,
        fieldName: this.fieldName,
        side: this.side,
        guide: this.guide,
      }),
    )
  }

  DocumentScanner.prototype.getOverlayPath = function (
    containerWidth,
    containerHeight,
    left,
    top,
    right,
    bottom,
    radius,
  ) {
    return [
      'M0 0',
      'H' + containerWidth,
      'V' + containerHeight,
      'H0',
      'Z',
      'M' + (left + radius) + ' ' + top,
      'H' + (right - radius),
      'A' + radius + ' ' + radius + ' 0 0 1 ' + right + ' ' + (top + radius),
      'V' + (bottom - radius),
      'A' + radius + ' ' + radius + ' 0 0 1 ' + (right - radius) + ' ' + bottom,
      'H' + (left + radius),
      'A' + radius + ' ' + radius + ' 0 0 1 ' + left + ' ' + (bottom - radius),
      'V' + (top + radius),
      'A' + radius + ' ' + radius + ' 0 0 1 ' + (left + radius) + ' ' + top,
      'Z',
    ].join(' ')
  }

  DocumentScanner.prototype.startCamera = function () {
    var scanner = this

    ensureMediaDevicesCompatibility()

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment',
          },
        },
        audio: false,
      })
      .then(function (stream) {
        scanner.onMediaStream(stream)
      })
      .catch(function (error) {
        scanner.onMediaError(error)
      })
  }

  DocumentScanner.prototype.onMediaStream = function (stream) {
    this.stream = stream
    this.attachStreamToVideo()

    this.wrapper.classList.add('app-document-scanner-wrapper--camera-ready')
    this.wrapper.classList.remove('app-document-scanner-wrapper--camera-error')

    if (this.revealFormOnCameraReady && this.form) {
      showElement(this.form)
    }

    hideElement(this.displayUntilCameraReady)
    this.hidePermissionWarning()

    var scanner = this

    window.setTimeout(function () {
      scanner.playVideo()
      scanner.updateGuideGeometry()
    }, 0)
  }

  DocumentScanner.prototype.onMediaError = function (error) {
    var message =
      'We could not access your camera. Please check your browser permissions and try again.'

    if (error && error.name === 'NotAllowedError') {
      message = 'Camera access was denied. Please allow camera access and try again.'
    } else if (error && error.name === 'NotFoundError') {
      message = 'No camera could be found on this device.'
    } else if (error && error.name === 'NotReadableError') {
      message = 'Your camera is currently being used by another application.'
    } else if (error && error.name === 'SecurityError') {
      message = 'Your browser security settings are preventing access to the camera.'
    }

    this.wrapper.classList.add('app-document-scanner-wrapper--camera-error')
    this.showPermissionWarning(message)
    this.setState('error')
  }

  DocumentScanner.prototype.onLoadedMetadata = function () {
    this.canvas.width = this.video.videoWidth
    this.canvas.height = this.video.videoHeight

    this.video.setAttribute('width', this.video.videoWidth)
    this.video.setAttribute('height', this.video.videoHeight)
    this.canvas.setAttribute('width', this.video.videoWidth)
    this.canvas.setAttribute('height', this.video.videoHeight)

    this.isReady = true
    this.playVideo()
  }

  DocumentScanner.prototype.hasLiveStream = function () {
    if (!this.stream) {
      return false
    }

    return this.stream.getVideoTracks().some(function (track) {
      return track.readyState === 'live'
    })
  }

  DocumentScanner.prototype.attachStreamToVideo = function () {
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

  DocumentScanner.prototype.playVideo = function () {
    var scanner = this

    if (!this.video || typeof this.video.play !== 'function') {
      return
    }

    var playPromise = this.video.play()

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (!scanner.hasLiveStream()) {
          scanner.showPermissionWarning(
            'The camera preview could not be restarted. Refresh the page and allow camera access.',
          )
        }
      })
    }
  }

  DocumentScanner.prototype.resumeOrRestartCamera = function () {
    var scanner = this

    if (this.hasLiveStream()) {
      this.attachStreamToVideo()

      window.setTimeout(function () {
        scanner.playVideo()
        scanner.updateGuideGeometry()
      }, 0)

      return
    }

    this.isReady = false
    this.startCamera()
  }

  DocumentScanner.prototype.capture = function () {
    if (!this.isReady || !this.video.videoWidth || !this.video.videoHeight) {
      this.showPermissionWarning('The camera is not ready yet. Try again in a moment.')
      return ''
    }

    var image = this.captureGuideArea()
    this.input.value = image

    this.wrapper.dispatchEvent(
      createCustomEvent('document-scanner:capture', {
        id: this.id,
        fieldName: this.fieldName,
        side: this.side,
        image: image,
      }),
    )

    return image
  }

  DocumentScanner.prototype.captureGuideArea = function () {
    if (!this.guide) {
      this.updateGuideGeometry()
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

  DocumentScanner.prototype.clear = function () {
    this.input.value = ''

    var context = this.canvas.getContext('2d')
    context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.wrapper.dispatchEvent(
      createCustomEvent('document-scanner:clear', {
        id: this.id,
        fieldName: this.fieldName,
        side: this.side,
      }),
    )
  }

  DocumentScanner.prototype.getImage = function () {
    return this.input.value
  }

  DocumentScanner.prototype.setDetected = function (isDetected) {
    this.setState(isDetected ? 'detected' : 'searching')
  }

  DocumentScanner.prototype.setState = function (state) {
    if (VALID_STATES.indexOf(state) === -1) {
      state = DEFAULT_STATE
    }

    this.scanWindow.classList.remove(
      'app-document-scanner__window--searching',
      'app-document-scanner__window--detected',
      'app-document-scanner__window--error',
    )

    this.scanWindow.classList.add('app-document-scanner__window--' + state)
    this.wrapper.setAttribute('data-state', state)
    this.state = state

    if (this.status) {
      this.status.textContent = this.getStatusText(state)
    }
  }

  DocumentScanner.prototype.getStatusText = function (state) {
    if (state === 'detected') {
      return 'Document detected.'
    }

    if (state === 'error') {
      return 'There is a problem with the camera.'
    }

    return 'Position the document inside the frame.'
  }

  DocumentScanner.prototype.showPermissionWarning = function (message) {
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

  DocumentScanner.prototype.hidePermissionWarning = function () {
    if (!this.permissionWarning) {
      return
    }

    this.permissionWarning.hidden = true
  }

  DocumentScanner.prototype.stop = function () {
    if (!this.stream) {
      return
    }

    this.stream.getTracks().forEach(function (track) {
      track.stop()
    })

    this.stream = null
  }

  function initialiseDocumentScanners() {
    var wrappers = document.querySelectorAll(SCANNER_SELECTOR)

    Array.prototype.forEach.call(wrappers, function (wrapper, index) {
      if (wrapper.getAttribute('data-document-scanner-initialised') === 'true') {
        return
      }

      var scanner = new DocumentScanner(wrapper)
      var registryId = scanner.id || 'scanner-' + index

      wrapper.setAttribute('data-document-scanner-initialised', 'true')
      window.documentScanners[registryId] = scanner

      scanner.init()
    })
  }

  function scannerBelongsToForm(scanner, wrapper, form) {
    if (elementContains(form, wrapper)) {
      return true
    }

    if (scanner.formId && form.id && scanner.formId === form.id) {
      return true
    }

    return false
  }

  function scannerInputBelongsToForm(scanner, form) {
    if (elementContains(form, scanner.input)) {
      return true
    }

    if (form.id && getInputFormId(scanner.input) === form.id) {
      return true
    }

    return false
  }

  function captureScannersInForm(event) {
    var form = event.target

    if (!form || form.tagName.toLowerCase() !== 'form') {
      return
    }

    var wrappers = document.querySelectorAll(SCANNER_SELECTOR)
    var failed = false

    Array.prototype.forEach.call(wrappers, function (wrapper) {
      var id = normaliseId(wrapper.getAttribute('data-scanner-id'))
      var scanner = window.documentScanners[id]

      if (!scanner || !scanner.captureOnSubmit) {
        return
      }

      if (!scannerBelongsToForm(scanner, wrapper, form)) {
        return
      }

      if (!scannerInputBelongsToForm(scanner, form)) {
        failed = true
        scanner.showPermissionWarning(
          'The scanner field is not associated with the form. Check the form id or the formId parameter.',
        )
        return
      }

      var image = scanner.capture()

      if (!image) {
        failed = true
      }
    })

    if (failed) {
      event.preventDefault()
    }
  }

  function resumeScannersAfterPageShow() {
    if (!window.documentScanners) {
      return
    }

    Object.keys(window.documentScanners).forEach(function (id) {
      var scanner = window.documentScanners[id]

      if (scanner && typeof scanner.resumeOrRestartCamera === 'function') {
        scanner.resumeOrRestartCamera()
      }
    })
  }

  if (!window.__appDocumentScannerSubmitListenerAdded) {
    document.addEventListener('submit', captureScannersInForm, true)
    window.__appDocumentScannerSubmitListenerAdded = true
  }

  if (!window.__appDocumentScannerPageShowListenerAdded) {
    window.addEventListener('pageshow', function () {
      resumeScannersAfterPageShow()
    })
    window.__appDocumentScannerPageShowListenerAdded = true
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiseDocumentScanners)
  } else {
    initialiseDocumentScanners()
  }

  window.DocumentScanner = DocumentScanner
  window.initDocumentScanners = initialiseDocumentScanners
})()
