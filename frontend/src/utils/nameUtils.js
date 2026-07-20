export function formatNameFromEmail(email) {
  if (!email) return "Student";

  const localPart = email.split("@")[0];

  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ") || "Student";
}

export function getInitials(name) {
  if (!name) return "S";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "S";
  }

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}
