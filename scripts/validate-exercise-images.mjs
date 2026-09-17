import { access, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(root, 'src/data/exercise-images.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const exercisesSource = await readFile(path.join(root, 'src/data/exercises.ts'), 'utf8')
const sourceFile = ts.createSourceFile('exercises.ts', exercisesSource, ts.ScriptTarget.Latest, true)
const errors = []
let exerciseIds = []

for (const statement of sourceFile.statements) {
  if (!ts.isVariableStatement(statement)) continue
  const declaration = statement.declarationList.declarations.find(item => item.name.getText(sourceFile) === 'details')
  if (!declaration?.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) continue
  exerciseIds = declaration.initializer.properties.flatMap(property => {
    if (!ts.isPropertyAssignment(property)) return []
    if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) return [property.name.text]
    return []
  })
}

if (exerciseIds.length === 0) errors.push('could not read exercise ids from src/data/exercises.ts')

for (const exerciseId of exerciseIds) {
  if (!(exerciseId in manifest)) errors.push(`${exerciseId}: missing image manifest entry`)
}

for (const exerciseId of Object.keys(manifest)) {
  if (!exerciseIds.includes(exerciseId)) errors.push(`${exerciseId}: image manifest entry has no matching Exercise`)
}

for (const [exerciseId, images] of Object.entries(manifest)) {
  if (!Array.isArray(images) || images.length < 2) {
    errors.push(`${exerciseId}: expected at least two images`)
    continue
  }

  for (const image of images) {
    if (typeof image !== 'string' || !image.startsWith(`/exercises/${exerciseId}/`) || !image.endsWith('.webp')) {
      errors.push(`${exerciseId}: invalid image path ${String(image)}`)
      continue
    }

    try {
      await access(path.join(root, 'public', image.slice(1)), constants.R_OK)
    } catch {
      errors.push(`${exerciseId}: missing file public${image}`)
    }
  }
}

if (errors.length > 0) {
  console.error(`Exercise image validation failed:\n${errors.map(error => `- ${error}`).join('\n')}`)
  process.exit(1)
}

const imageCount = Object.values(manifest).reduce((total, images) => total + images.length, 0)
console.log(`Validated ${imageCount} exercise images for ${Object.keys(manifest).length} exercises.`)
