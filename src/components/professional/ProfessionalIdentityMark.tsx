type Props = {
  username: string | null;
  verified: boolean;
  pending?: boolean;
};

/** Subtle Professional designation near @username — not a social-media checkmark. */
export function ProfessionalIdentityMark({
  username,
  verified,
  pending = false,
}: Props) {
  return (
    <div className="professional-identity">
      {username ? (
        <p className="professional-identity__username">{username}</p>
      ) : null}
      <p className="professional-identity__badge">
        <span className="professional-identity__spark" aria-hidden="true">
          ✦
        </span>
        {pending
          ? "Professional · Pending"
          : verified
            ? "Verified Professional"
            : "Professional"}
      </p>
    </div>
  );
}
