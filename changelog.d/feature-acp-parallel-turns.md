### Changed

- A custom agent that runs `kiro-cli acp` now works on its chat, its tasks and its channel
  assignments at the same time. Before, OpenBot ran one turn of a custom agent at a time, so a task
  or a channel request waited for the agent's other work. Other custom agents still run one turn at
  a time.
