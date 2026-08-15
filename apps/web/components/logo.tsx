type LogoProps = {
  readonly compact?: boolean;
  readonly inverse?: boolean;
};

export function Logo({ compact = false, inverse = false }: LogoProps) {
  const textColor = inverse ? "#F7FAFC" : "#14233A";

  return (
    <div className="logo" aria-label="Omni">
      <svg viewBox="0 0 44 44" aria-hidden="true" className="logo-mark">
        <path d="M22 4.5a17.5 17.5 0 1 0 0 35c7.7 0 14.2-5 16.5-11.9H25.8a5 5 0 1 1 0-10h12.7A17.5 17.5 0 0 0 22 4.5Z" fill="#B9F950" />
        <path d="M22 13.2a8.8 8.8 0 1 0 0 17.6h16.5a17.6 17.6 0 0 0 .5-4.3H22a4.4 4.4 0 1 1 0-8.8h17a17.5 17.5 0 0 0-.5-4.5H22Z" fill="#4D78FF" />
      </svg>
      {!compact && <span style={{ color: textColor }}>omni<span className="logo-dot">.</span></span>}
    </div>
  );
}
