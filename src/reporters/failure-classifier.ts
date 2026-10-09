export type FailureCategory = 'environment' | 'script-error' | 'bug';

export interface FailureClassification {
  category: FailureCategory;
  reason: string;
}

/**
 * Three-bucket triage. Each bucket needs a different response: an outage is
 * not a code defect, a broken locator is ours to fix, and a clean run with a
 * wrong outcome is a finding about kumparan itself. The classifier is a first
 * guess; a "bug" is only filed after a human reproduces it (see docs/bugs/).
 */
const ENVIRONMENT = /econnrefused|enotfound|getaddrinfo|net::err_|socket hang up|browser.*closed unexpectedly|cf-chl|503 service unavailable|don't have permission to access this website/i;
const SCRIPT_ERROR = /locator\..*timeout|waiting for (locator|selector|getByTestId)|strict mode violation|target (page, context or browser )?(has been )?closed|element is not attached|outside of the viewport|intercepts pointer events/i;

export function classifyFailure(message: string): FailureClassification {
  if (ENVIRONMENT.test(message)) {
    return {
      category: 'environment',
      reason: 'Network failure or bot-protection block reaching the target. Not a product defect; check availability and rerun.',
    };
  }
  if (SCRIPT_ERROR.test(message)) {
    return {
      category: 'script-error',
      reason: 'The test could not find or interact with an element: a UI change or a timing gap in our page object. Ours to fix, not a product defect.',
    };
  }
  return {
    category: 'bug',
    reason: 'Every step executed, but an assertion on the outcome failed. Candidate product defect: reproduce manually before filing.',
  };
}
