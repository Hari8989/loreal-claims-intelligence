import type { CSSProperties } from 'react';
import type {
  ApiDecision,
  AssessmentResponse,
  DisplayDecision,
} from '../types/assessment';

const decisionLabels: Record<ApiDecision, DisplayDecision> = {
  SUPPORTED: 'JUSTIFIED',
  NOT_SUPPORTED: 'NOT_JUSTIFIED',
  INCONCLUSIVE: 'INCONCLUSIVE',
};

const decisionDescriptions: Record<ApiDecision, string> = {
  SUPPORTED: 'The supplied evidence supports the claim.',
  NOT_SUPPORTED: 'The supplied evidence does not support the claim.',
  INCONCLUSIVE: 'The supplied evidence is not sufficient for a conclusion.',
};

interface AssessmentResultProps {
  result: AssessmentResponse | null;
  onNewAssessment: () => void;
  isLoading: boolean;
}

export function AssessmentResult({
  result,
  onNewAssessment,
  isLoading,
}: AssessmentResultProps) {
  if (isLoading) {
    return <AssessmentLoading />;
  }

  if (!result) {
    return <AssessmentEmptyState />;
  }

  const displayDecision = decisionLabels[result.decision];
  const decisionClass = result.decision.toLowerCase().replaceAll('_', '-');

  return (
    <section
      className={`result-card result-${decisionClass}`}
      aria-labelledby="result-title"
      aria-live="polite"
    >
      <div className="result-topline">
        <div className="result-label">
          <span className="result-check" aria-hidden="true">
            <DecisionMark decision={result.decision} />
          </span>
          <span>Assessment complete</span>
        </div>
        <button className="icon-text-button" type="button" onClick={onNewAssessment}>
          New assessment
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 10h11M10 5l5 5-5 5" />
          </svg>
        </button>
      </div>

      <div className="decision-summary">
        <div>
          <p className="eyebrow">Evidence assessment</p>
          <h2 id="result-title" className="decision-title">
            {displayDecision}
          </h2>
          <p className="decision-description">{decisionDescriptions[result.decision]}</p>
        </div>
        <div
          className="score-ring"
          style={{ '--score': `${result.confidenceScore}%` } as CSSProperties}
          role="img"
          aria-label={`AI assessment confidence score: ${result.confidenceScore} out of 100`}
        >
          <div className="score-ring-inner">
            <strong>{result.confidenceScore}</strong>
            <span>/ 100</span>
          </div>
        </div>
      </div>
      <p className="score-caption">
        AI assessment score <span aria-hidden="true">·</span> Not a statistically
        calibrated probability
      </p>

      <div className="result-divider" />

      <section className="result-section" aria-labelledby="reasoning-title">
        <h3 id="reasoning-title">
          <span className="section-icon reasoning-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M10 2.7v2M10 15.3v2M2.7 10h2m10.6 0h2M4.85 4.85l1.4 1.4m7.5 7.5 1.4 1.4m0-10.3-1.4 1.4m-7.5 7.5-1.4 1.4M7 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
            </svg>
          </span>
          Reasoning
        </h3>
        <p className="reasoning-copy">{result.reasoning}</p>
      </section>

      <section className="result-section limitations-section" aria-labelledby="limitations-title">
        <h3 id="limitations-title">
          <span className="section-icon limitation-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M10 2.5 18 17H2L10 2.5Z" />
              <path d="M10 7v4m0 2.5v.1" />
            </svg>
          </span>
          Limitations
          <span className="count-pill">{result.limitations.length}</span>
        </h3>
        {result.limitations.length > 0 ? (
          <ul className="limitations-list">
            {result.limitations.map((limitation, index) => (
              <li key={`${index}-${limitation}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-limitations">No limitations were returned by the assessment.</p>
        )}
      </section>

      <div className="review-notice" role="note">
        <span className="notice-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20">
            <path d="M10 2.5 17 5v4.7c0 3.3-2.3 6.2-7 7.8-4.7-1.6-7-4.5-7-7.8V5l7-2.5Z" />
            <path d="m7 10 2 2 4-4" />
          </svg>
        </span>
        <div>
          <strong>Human review required</strong>
          <p>{result.notice}</p>
        </div>
      </div>

      <dl className="record-identifiers">
        <div>
          <dt>Claim ID</dt>
          <dd title={result.claimId}>{result.claimId}</dd>
        </div>
        <div>
          <dt>Assessment ID</dt>
          <dd title={result.assessmentId}>{result.assessmentId}</dd>
        </div>
      </dl>
    </section>
  );
}

function DecisionMark({ decision }: { decision: ApiDecision }) {
  if (decision === 'SUPPORTED') {
    return (
      <svg viewBox="0 0 20 20">
        <path d="m4 10 4 4 8-8" />
      </svg>
    );
  }

  if (decision === 'NOT_SUPPORTED') {
    return (
      <svg viewBox="0 0 20 20">
        <path d="m5 5 10 10M15 5 5 15" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20">
      <path d="M10 6v4m0 3v.1" />
      <circle cx="10" cy="10" r="7.3" />
    </svg>
  );
}

function AssessmentLoading() {
  return (
    <section className="empty-state loading-state" aria-live="polite" aria-busy="true">
      <div className="loading-orbit" aria-hidden="true">
        <span />
      </div>
      <p className="eyebrow">Assessment in progress</p>
      <h2>Reviewing the evidence</h2>
      <p>
        The supplied claim and evidence are being evaluated. This may take a few moments.
      </p>
      <div className="loading-steps" aria-hidden="true">
        <span className="active" />
        <span className="active" />
        <span />
      </div>
    </section>
  );
}

function AssessmentEmptyState() {
  return (
    <section className="empty-state" aria-labelledby="empty-title">
      <div className="science-illustration" aria-hidden="true">
        <svg viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="58" />
          <ellipse cx="80" cy="80" rx="24" ry="58" />
          <ellipse cx="80" cy="80" rx="58" ry="24" />
          <path d="M38 105c12-18 25-27 42-27s30 9 42 27" />
          <circle cx="80" cy="80" r="5" className="illustration-dot" />
          <circle cx="48" cy="50" r="3" className="illustration-dot" />
          <circle cx="119" cy="105" r="3" className="illustration-dot" />
        </svg>
      </div>
      <p className="eyebrow">Your assessment workspace</p>
      <h2 id="empty-title">Evidence, meet claim.</h2>
      <p>
        Add a product claim and its supporting scientific evidence to receive a structured
        assessment.
      </p>
      <div className="empty-state-rule" />
      <p className="empty-state-note">
        The engine evaluates only the evidence you provide. Every result requires human
        scientific and regulatory review.
      </p>
    </section>
  );
}
