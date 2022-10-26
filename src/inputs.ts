import parseInputs from '@wow-actions/parse-inputs'

export function getInputs() {
  return parseInputs({
    skipDraft: { type: 'boolean' },
    addReviewers: { type: 'boolean', defaultValue: true },
    addAssignees: { type: 'booleanOrString', defaultValue: 'author' },
    reviewers: { type: 'words' },
    assignees: { type: 'words' },
    numberOfAssignees: { type: 'int', defaultValue: 0 },
    numberOfReviewers: { type: 'int', defaultValue: 0 },
    skipKeywords: { type: 'words' },
    includeLabels: { type: 'stringArray' },
    excludeLabels: { type: 'stringArray' },
  })
}

export type Inputs = ReturnType<typeof getInputs>
