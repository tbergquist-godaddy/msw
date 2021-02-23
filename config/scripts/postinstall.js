const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// When executing the "postinstall" script, the "process.cwd" equals
// the package directory, not the parent project where the package is installed.
// NPM stores the parent project directory in the "INIT_CWD" env variable.
const parentPackageCwd = process.env.INIT_CWD

// 1. Check if "package.json" has "msw.workerDirectory" property set.
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(parentPackageCwd, 'package.json'), 'utf8'),
)

if (!packageJson.msw || !packageJson.msw.workerDirectory) {
  return
}

// 2. Check if the worker directory is an existing path.
const { workerDirectory } = packageJson.msw
const absoluteWorkerDirectory = path.resolve(parentPackageCwd, workerDirectory)

if (!fs.existsSync(absoluteWorkerDirectory)) {
  return console.error(
    `[MSW] Failed to automatically update the worker script at "%s": given path does not exist.`,
    workerDirectory,
  )
}

// 3. Update the worker script.
const cliExecutable = path.resolve(process.cwd(), '../../cli/index.js')
const relativeCliExecutable = path.relative(parentPackageCwd, cliExecutable)

try {
  execSync(`node ${relativeCliExecutable} init ${absoluteWorkerDirectory}`, {
    cwd: parentPackageCwd,
  })
} catch (error) {
  console.error(
    `[MSW] Failed to automatically update the worker script:\n${error}`,
  )
}
