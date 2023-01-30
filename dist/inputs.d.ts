export declare function getInputs(): {
    skipDraft: boolean;
    addReviewers: boolean;
    addAssignees: boolean;
    reviewers: string[];
    assignees: string[];
    numberOfAssignees: number;
    numberOfReviewers: number;
    skipKeywords: string[];
    includeLabels: string[];
    excludeLabels: string[];
};
export type Inputs = ReturnType<typeof getInputs>;
