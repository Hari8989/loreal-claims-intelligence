import { useRef, useState } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { AssessmentResult } from './components/AssessmentResult';
import { assessClaim, getAssessmentErrorMessage } from './services/claims-api';
import type {
  AssessmentFormValues,
  AssessmentResponse,
} from './types/assessment';

function App() {
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const submitting = useRef(false);

  async function handleAssessment(values: AssessmentFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await assessClaim(values);
      setResult(response);
    } catch (error) {
      setErrorMessage(getAssessmentErrorMessage(error));
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  }

  function startNewAssessment() {
    setResult(null);
    setErrorMessage(null);
    setFormKey((current) => current + 1);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main" aria-label="Claims Intelligence Engine home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="brand-name">L&apos;ORÉAL <span>RESEARCH</span></span>
        </a>
        <div className="workspace-label">
          <span className="workspace-dot" aria-hidden="true" />
          Internal workspace
        </div>
      </header>

      <main id="main" className="page-content">
        <section className="page-heading" aria-labelledby="page-title">
          <div className="heading-copy">
            <div className="breadcrumb">
              <span>Research &amp; Innovation</span>
              <span className="breadcrumb-separator" aria-hidden="true">/</span>
              <span>Claims</span>
            </div>
            <p className="eyebrow heading-eyebrow">
              <span className="eyebrow-line" aria-hidden="true" />
              Scientific substantiation
            </p>
            <h1 id="page-title">Claims Intelligence Engine</h1>
            <p className="page-description">
              Assess product claims against submitted evidence with a clear, traceable
              scientific review starting point.
            </p>
          </div>
          <div className="heading-aside" aria-label="Workflow">
            <span className="workflow-number">01</span>
            <span className="workflow-divider" aria-hidden="true" />
            <span className="workflow-label">Claim assessment</span>
          </div>
        </section>

        <div className="workspace-grid">
          <section className="panel form-panel" aria-label="Claim and evidence input">
            <div className="panel-topline">
              <span className="panel-step">01</span>
              <span>Claim &amp; evidence</span>
              <span className="panel-topline-rule" aria-hidden="true" />
              <span className="panel-context">Assessment input</span>
            </div>
            <AssessmentForm
              key={formKey}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onSubmit={handleAssessment}
              onReset={startNewAssessment}
            />
          </section>

          <section className="panel result-panel" aria-label="Assessment result">
            <div className="panel-topline">
              <span className="panel-step panel-step-secondary">02</span>
              <span>Assessment</span>
              <span className="panel-topline-rule" aria-hidden="true" />
              <span className="panel-context">Evidence review</span>
            </div>
            <AssessmentResult
              result={result}
              onNewAssessment={startNewAssessment}
              isLoading={isLoading}
            />
          </section>
        </div>

        <footer className="page-footer">
          <div className="footer-mark" aria-hidden="true">L</div>
          <p>Claims Intelligence Engine <span>·</span> Research &amp; Innovation</p>
          <p className="footer-disclaimer">AI-assisted assessment · Human review required</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
