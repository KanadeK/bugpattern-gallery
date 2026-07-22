# Privacy and security

The v0.1.0 application has no authentication, analytics, database, upload path, network adapter, or remote code execution. Exhibits operate only on synthetic inputs compiled into the application. The runner rejects unknown case ids and output formatting redacts values whose keys look like secret, token, password, or authorization material.

Do not add credentials or real incident data to examples. A future online adapter must keep a deterministic fixture equivalent and document data handling before it is enabled.
