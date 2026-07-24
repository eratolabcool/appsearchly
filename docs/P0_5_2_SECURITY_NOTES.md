# Submission Pipeline Security Notes

The URL verifier blocks localhost, `.local`, loopback, link-local, and RFC1918 IPv4 literals before the outbound request. DNS rebinding and IPv6 private-range resolution require a later network-layer resolver enhancement; production egress controls should remain enabled where available.

Turnstile is fail-closed in production. Accepted records are never auto-published. Database writes are parameterized and transactionally grouped.
