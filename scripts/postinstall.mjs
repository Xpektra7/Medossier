import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const transformerPath = resolve(root, 'node_modules/react-native-css/dist/commonjs/metro/metro-transformer.js')

try {
  let content = readFileSync(transformerPath, 'utf8')
  const oldCode = `require(_metroConfig.unstable_transformerPath)`
  const newCode = `require(require.resolve('metro-transform-worker'))`

  if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode)
    writeFileSync(transformerPath, content, 'utf8')
    console.log('patched react-native-css metro-transformer for SDK 52 compat')
  } else if (content.includes(newCode)) {
    console.log('react-native-css already patched')
  } else {
    console.warn('react-native-css patch target not found — file may have changed')
  }
} catch (err) {
  console.error('Failed to patch react-native-css:', err.message)
}
