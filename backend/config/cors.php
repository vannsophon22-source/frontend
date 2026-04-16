<?php

return [
    'paths' => ['api/*'], // Allow all API routes
    'allowed_methods' => ['*'], // Allow all HTTP methods
    'allowed_origins' => [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
], // Your Next.js frontend
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];