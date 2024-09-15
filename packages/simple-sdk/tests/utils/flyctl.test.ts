import { describe, beforeEach, it, expect, mock } from "bun:test";
import { flyctlExecute } from "../../src/utils/flyctl";

describe("flyctlExecute", () => {
  beforeEach(() => {
    mock.restore();
  });

  it("should execute command successfully on first attempt", async () => {
    mock.module("node:child_process", () => ({
      exec: (
        cmd: string,
        cb: (
          error: Error | null,
          stdout: string | null,
          stderr: string | null
        ) => void
      ) => cb(null, "Success", ""),
    }));

    const result = await flyctlExecute("flyctl status", 3, true);
    expect(result).toEqual({ stdout: "Success", stderr: "" });
  });

  it("should retry upon failure and eventually succeed", async () => {
    let callCount = 0;
    mock.module("node:child_process", () => ({
      exec: (
        cmd: string,
        cb: (
          error: Error | null,
          stdout: string | null,
          stderr: string | null
        ) => void
      ) => {
        callCount++;
        if (callCount === 1) {
          cb(new Error("Failure 1"), null, null);
        } else {
          cb(null, "Success on retry", "");
        }
      },
    }));

    const result = await flyctlExecute("flyctl status", 3, true);
    expect(result).toEqual({ stdout: "Success on retry", stderr: "" });
  });

  it("should fail after all retry attempts", async () => {
    mock.module("node:child_process", () => ({
      exec: (
        cmd: string,
        cb: (
          error: Error | null,
          stdout: string | null,
          stderr: string | null
        ) => void
      ) => cb(new Error("Persistent Failure"), null, null),
    }));

    await expect(flyctlExecute("flyctl status", 2, true)).rejects.toThrow(
      "Command failed after 2 attempts: flyctl status\nPersistent Failure"
    );
  });
});
