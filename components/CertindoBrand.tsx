export default function CertindoBrand({
  inverse = false,
  compact = false,
}: {
  inverse?: boolean;
  compact?: boolean;
}) {
  return (
    <span className={`brand${inverse ? " brand-inverse" : ""}${compact ? " brand-compact" : ""}`}>
      <img
        className="brand-logo"
        src="/assets/logo-certindo.png"
        alt="CERTINDO"
        width={500}
        height={500}
      />
      {!compact && (
        <span className="brand-copy">
          <strong>CERTINDO</strong>
          <small>Calibration Services</small>
        </span>
      )}
    </span>
  );
}
