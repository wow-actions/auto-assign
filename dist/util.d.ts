import { Inputs } from './inputs';
export declare function getOctokit(): import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
};
export declare function isValidEvent(event: string, action?: string | string[]): boolean | "" | undefined;
export declare function hasSkipKeywords(title: string, keywords: string[]): boolean;
export declare function chooseReviewers(owner: string, inputs: Inputs): {
    reviewers: string[];
    teamReviewers: string[];
};
export declare function chooseAssignees(owner: string, inputs: Inputs): string[];
export declare function hasAnyLabel(labels: string[]): boolean;
export declare function skip(msg: string): void;
