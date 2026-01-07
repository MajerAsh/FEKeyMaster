// Demo-only puzzles for deep links like /puzzle/2?demo=dial
// NOTE: These solutions live in the frontend bundle in demo mode.
// If you want to avoid exposing solutions, you’d need server-side validation.

export const DEMO_PUZZLES = [
  {
    id: 1,
    name: "Pin Tumbler Lock (Demo)",
    prompt:
      "Align all 5 pins to the correct height to unlock the cabinet and get the treat.",
    type: "pin-tumbler",
    // Keep as JSON string to match your existing parsing flow
    solution_code: JSON.stringify([40, 30, 50, 20, 60]),
  },
  {
    id: 2,
    name: "Dial Lock (Demo)",
    prompt:
      "Follow the tips to find each number of the 3 number combination to unlock the treat.",
    type: "dial",
    solution_code: JSON.stringify([3, 1, 4]),
  },
];

export function getDemoPuzzle(id, demoType) {
  // Prefer a specific id if present; otherwise pick by type
  if (Number.isFinite(id)) {
    const byId = DEMO_PUZZLES.find((p) => p.id === id);
    if (byId) return byId;
  }
  if (demoType === "dial") return DEMO_PUZZLES.find((p) => p.type === "dial");
  if (demoType === "pin")
    return DEMO_PUZZLES.find((p) => p.type === "pin-tumbler");
  return DEMO_PUZZLES[0];
}
