# Windows browser cookie debugging (2025-11-21)

Summary
- Browser engine runs on Windows but fails to reuse ChatGPT session because cookies are not applied; login check stops with “ChatGPT session not detected.”
- chrome-cookies-secure expects a directory containing a file named `Cookies`; we now copy the DB into a temp dir and pass that. Still seeing no session.
- Native decrypt path (DPAPI + AES-GCM) runs without throwing, but may be yielding empty/invalid cookies for ChatGPT.

What we tried
- Copied locked `Cookies` DB and `Local State` with PowerShell FileShare=ReadWrite into temp files named `Cookies` / `Local State`.
- Decrypted AES key via DPAPI (prebuilt `win-dpapi`), read cookies with sqlite3, decrypted AES-GCM values.
- Passed the copied temp directory to chrome-cookies-secure as fallback.
- Runs now fail at login (no cookies applied), not with path errors.

Active oracle sessions for context
- `windows-api-smoke-test` — API engine smoke (completed).
- `windows browser smoke test` — Browser runs show “session not detected”.
- `windows-cookie-fix` — Asked gpt-5.1-pro for suggestions; reattach via `oracle session windows-cookie-fix --render`.

Ideas to try next
- Confirm we’re reading the same profile used for login (maybe not `Default`).
- Validate decrypted cookies manually: run `loadWindowsCookies` and print any `__Secure-next-auth.session-token`/`oai-did` values to see if they are empty.
- If decrypted values are empty, try sql.js (WASM) to avoid sqlite version differences, or use `chrome --remote-debugging-port` + `--user-data-dir` and read cookies from that unlocked profile.
- Fallback path: allow `--browser-inline-cookies-file` flow and document it as the reliable Windows path until decrypt is solid.
