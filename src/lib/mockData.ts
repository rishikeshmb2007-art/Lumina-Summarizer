export const MOCK_SUMMARY = {
  title: "Operating Systems: Banker's Algorithm & Resource Allocation",
  keyPoints: [
    "Deadlock avoidance algorithm designed by Edsger Dijkstra.",
    "Tests for safety by simulating allocation for predetermined maximum resources.",
    "Ensures system never enters an unsafe state where deadlocks can occur."
  ],
  flashcards: [
    { question: "What is the primary purpose of the Banker's Algorithm?", answer: "To prevent deadlocks by checking resource allocation safety before granting requests." },
    { question: "What is a 'Safe State'?", answer: "A state where there is at least one sequence of process execution that avoids deadlock." },
    { question: "What inputs are needed for the algorithm?", answer: "Available resources, Allocation matrix, Max demand matrix, and Need matrix." }
  ],
  chatResponses: [
    "The Banker's Algorithm checks if allocating resources keeps the system in a safe state.",
    "If allocation leads to an unsafe state, the process must wait!"
  ]
};