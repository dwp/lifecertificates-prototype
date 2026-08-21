const fs = require('fs')
const path = require('path')

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

const createVersionRouter = require('./versions')

// The version considered to be current.
//
// Used by:
// - homepage Current version section
// - homepage Current journeys section
// - /current redirects
const currentVersion = '1'

// Version definition files live in:
//
// app/data/versions/
// ├─ 1.js
// ├─ 1.1.js
// ├─ 2.js
// └─ 2.1.js
//
// Load every version file so version metadata only
// needs maintaining in one place.
const versionsDirectory = path.join(__dirname, '../data/versions')

// Create a collection containing all versions.
//
// Each version becomes:
//
// {
//   version: '2.1',
//   data: { ...version metadata }
// }
//
// This collection is later used to:
// - register routes
// - identify the current version
// - build navigation
const allVersions = fs
  .readdirSync(versionsDirectory)
  .filter((file) => file.endsWith('.js'))
  .map((file) => {
    const versionId = file.replace('.js', '')

    return {
      version: versionId,
      data: require(`../data/versions/${versionId}`),
    }
  })
  .sort((a, b) => {
    // Supports:
    // 1
    // 1.1
    // 1.2
    // 2
    // 2.1

    const aParts = a.data.number.split('.').map(Number)
    const bParts = b.data.number.split('.').map(Number)

    const aMajor = aParts[0]
    const aMinor = aParts[1] || 0

    const bMajor = bParts[0]
    const bMinor = bParts[1] || 0

    if (aMajor !== bMajor) {
      return aMajor - bMajor
    }

    return aMinor - bMinor
  })

// Hidden versions remain accessible by direct URL
// but do not appear in navigation or tables.
//
// Create a collection containing only versions that
// should be visible to prototype users.
const visibleVersions = allVersions.filter((version) => version.data.visible !== false)

// Make commonly-used version information available
// to all templates.
router.use((req, res, next) => {
  // Current version identifier.
  //
  // Example:
  // 2
  // 2.1
  res.locals.currentVersion = currentVersion

  // Full version definition for the current version.
  //
  // Used by:
  // - Current version section
  // - Current journeys section
  res.locals.currentVersionData = allVersions.find((v) => v.version === currentVersion)?.data

  // Visible versions shown in:
  // - homepage version table
  // - version navigation
  //
  // Display newest version first.
  res.locals.versions = [...visibleVersions].reverse()

  next()
})

// Homepage
router.get('/', function (req, res) {
  res.render('index')
})

// Convenience redirects to the current version
router.get('/versions', function (req, res) {
  res.redirect('/')
})

router.get('/current', function (req, res) {
  res.redirect(`/versions/${currentVersion}`)
})

router.get('/current/customer', function (req, res) {
  res.redirect(`/versions/${currentVersion}/customer`)
})

router.get('/current/support-agent', function (req, res) {
  res.redirect(`/versions/${currentVersion}/support-agent`)
})

router.get('/current/service-manager', function (req, res) {
  res.redirect(`/versions/${currentVersion}/service-manager`)
})

router.get('/current/overview', function (req, res) {
  res.redirect(`/versions/${currentVersion}/overview`)
})

// Register routes for every discovered version.
//
// Examples:
//
// /versions/1
// /versions/1.1
// /versions/2
// /versions/2.1
//
// Hidden versions are included here so they remain
// accessible during development and review.
allVersions.forEach(function (version) {
  router.use(
    `/versions/${version.version}`,
    createVersionRouter({
      version: version.version,
    }),
  )
})

module.exports = router
