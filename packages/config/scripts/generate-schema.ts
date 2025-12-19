#!/usr/bin/env bun
/**
 * Generate config.schema.json from Zod schema
 * Uses Zod v4's native toJSONSchema function
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as z from 'zod'
import { ConfigSchema } from '../src/schema'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Convert Zod schema to JSON Schema using native Zod v4 function
const jsonSchema = z.toJSONSchema(ConfigSchema)

// Add custom metadata fields
const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://sniff.dev/schemas/config.schema.json',
  title: 'Sniff Agent Configuration',
  description: 'Schema for Sniff agent configuration file (sniff.yml) version 2.0',
  ...jsonSchema,
}

// Write to root config.schema.json
const outputPath = resolve(__dirname, '../../../config.schema.json')
writeFileSync(outputPath, JSON.stringify(schema, null, 2) + '\n')

console.log('Generated config.schema.json from Zod schema')
console.log(`  Output: ${outputPath}`)
