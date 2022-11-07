export declare function getInputs(): {
    skipDraft?: boolean | undefined;
    addReviewers?: boolean | undefined;
    addAssignees?: string | boolean | undefined;
    reviewers?: string[] | undefined;
    assignees?: string[] | undefined;
    numberOfAssignees?: number | undefined;
    numberOfReviewers?: number | undefined;
    skipKeywords?: string[] | undefined;
    includeLabels?: string[] | undefined;
    excludeLabels?: string[] | undefined;
};
export declare type Inputs = ReturnType<typeof getInputs>;
