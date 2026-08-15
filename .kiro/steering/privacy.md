# Privacy steering

Treat captured data as sensitive. Sanitize password fields, token-like URL query values, and sensitive header values before any write, log, report, or code-generation step. Do not capture request bodies, response bodies, cookies, or telemetry. New event fields require an explicit privacy review and a test proving secrets cannot reach exported output.
