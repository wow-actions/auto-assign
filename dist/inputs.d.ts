export declare function getInputs(): {
    skipDraft: boolean;
    addReviewers: boolean;
    addAssignees: string | boolean;
    reviewers: string[];
    assignees: string[];
    numberOfAssignees: number;
    numberOfReviewers: number;
    skipKeywords: string[];
    includeLabels: string[];
    excludeLabels: string[];
};
export declare type Inputs = ReturnType<typeof getInputs>;
