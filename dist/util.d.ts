import { Inputs } from './inputs';
export declare function skip(msg: string): void;
export declare function isValidEvent(event: string, action?: string | string[]): boolean | "" | undefined;
export declare function getOctokit(): import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
};
type Octokit = ReturnType<typeof getOctokit>;
export declare function hasSkipKeywords(title: string, keywords: string[]): boolean;
export declare function getIssueLabels(octokit: Octokit, issueNumber: number): Promise<string[]>;
export declare function getState(octokit: Octokit): Promise<{
    assignees: string[];
    teams: string[];
    reviewers: string[];
}>;
export declare function addReviewers(octokit: Octokit, inputs: Inputs): Promise<void>;
export declare function addAssignees(octokit: Octokit, inputs: Inputs): Promise<void>;
export {};
