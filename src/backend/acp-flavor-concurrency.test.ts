// A custom ACP agent runs one turn at a time, unless the flavor of its command says that it runs
// turns of two sessions at the same time. `agentTaskLimit` and the drain read this answer.
import { agentTaskLimit } from "@openbot/contracts/ipc";
import { describe, expect, it } from "vitest";
import { customAgentFlavor, customAgentRunsConcurrentTurns } from "./acp-flavor";

const agents = [
  { id: "kiro", command: "/opt/homebrew/bin/kiro-cli" },
  { id: "omp", command: "omp" },
  { id: "kiro-dev", command: "kiro-cli-dev" },
];

describe("customAgentFlavor concurrentTurns", () => {
  it("is set for kiro-cli, with any path or Windows extension", () => {
    for (const command of ["kiro-cli", "/usr/local/bin/kiro-cli", "C:\\bin\\kiro-cli.exe", "KIRO-CLI.cmd"])
      expect(customAgentFlavor(command).concurrentTurns).toBe(true);
  });

  it("is not set for other commands, also when the name contains kiro-cli", () => {
    for (const command of ["omp", "opencode", "kiro-cli-dev", "my-kiro-cli"])
      expect(customAgentFlavor(command).concurrentTurns).toBeUndefined();
  });
});

describe("customAgentRunsConcurrentTurns", () => {
  it("is true for a saved agent that runs kiro-cli", () => {
    expect(customAgentRunsConcurrentTurns(agents, "kiro/default")).toBe(true);
  });

  it("is false for another saved agent", () => {
    expect(customAgentRunsConcurrentTurns(agents, "omp/default")).toBe(false);
    expect(customAgentRunsConcurrentTurns(agents, "kiro-dev/default")).toBe(false);
  });

  it("is false for an agent that is not saved, and for a model with no agent segment", () => {
    expect(customAgentRunsConcurrentTurns(agents, "missing/default")).toBe(false);
    expect(customAgentRunsConcurrentTurns(agents, "default")).toBe(false);
    expect(customAgentRunsConcurrentTurns([], "kiro/default")).toBe(false);
  });
});

describe("agentTaskLimit with concurrentTurns", () => {
  it("keeps the limit of one for an ACP agent by default", () => {
    expect(agentTaskLimit({ provider: "acp", taskLimit: 3 }, 4)).toBe(1);
  });

  it("uses the agent limit, then the host default, when the agent runs turns in parallel", () => {
    expect(agentTaskLimit({ provider: "acp", taskLimit: 3 }, 4, true)).toBe(3);
    expect(agentTaskLimit({ provider: "acp" }, 4, true)).toBe(4);
  });

  it("gives one when the caller says that the agent runs one turn at a time", () => {
    expect(agentTaskLimit({ provider: "codex", taskLimit: 3 }, 4, false)).toBe(1);
  });

  it("keeps the answer of the provider when the caller gives none", () => {
    expect(agentTaskLimit({ provider: "codex", taskLimit: 3 }, 4)).toBe(3);
  });
});
