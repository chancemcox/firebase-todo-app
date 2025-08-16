<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.27.1/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #2c3e50;
        }
        .swagger-ui .topbar .download-url-wrapper .select-label {
            color: #fff;
        }
        .swagger-ui .topbar .download-url-wrapper input[type=text] {
            border: 2px solid #34495e;
        }
        .swagger-ui .topbar .download-url-wrapper .btn-download {
            background-color: #3498db;
            border-color: #3498db;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.27.1/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.27.1/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '{{ route("l5-swagger.api") }}',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                validatorUrl: null,
                docExpansion: 'list',
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // Add Bearer token if available
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        request.headers.Authorization = 'Bearer ' + token;
                    }
                    return request;
                },
                onComplete: function() {
                    // Add login form to the page
                    const topbar = document.querySelector('.swagger-ui .topbar');
                    if (topbar) {
                        const loginForm = document.createElement('div');
                        loginForm.style.cssText = 'margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;';
                        loginForm.innerHTML = `
                            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">API Authentication</h4>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <input type="email" id="login-email" placeholder="Email" style="padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                                <input type="password" id="login-password" placeholder="Password" style="padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                                <button onclick="login()" style="padding: 5px 15px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer;">Login</button>
                                <button onclick="logout()" style="padding: 5px 15px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Logout</button>
                            </div>
                            <div id="login-status" style="margin-top: 10px; font-size: 12px;"></div>
                        `;
                        topbar.appendChild(loginForm);
                    }
                }
            });
        };

        function login() {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const statusDiv = document.getElementById('login-status');

            if (!email || !password) {
                statusDiv.innerHTML = '<span style="color: #e74c3c;">Please enter both email and password</span>';
                return;
            }

            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem('access_token', data.access_token);
                    statusDiv.innerHTML = '<span style="color: #27ae60;">Login successful! You can now test protected endpoints.</span>';
                    // Refresh the page to update Swagger UI
                    setTimeout(() => location.reload(), 1000);
                } else {
                    statusDiv.innerHTML = '<span style="color: #e74c3c;">Login failed: ' + (data.message || 'Unknown error') + '</span>';
                }
            })
            .catch(error => {
                statusDiv.innerHTML = '<span style="color: #e74c3c;">Login failed: ' + error.message + '</span>';
            });
        }

        function logout() {
            const token = localStorage.getItem('access_token');
            if (token) {
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    }
                })
                .then(() => {
                    localStorage.removeItem('access_token');
                    document.getElementById('login-status').innerHTML = '<span style="color: #27ae60;">Logged out successfully</span>';
                    setTimeout(() => location.reload(), 1000);
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    localStorage.removeItem('access_token');
                    document.getElementById('login-status').innerHTML = '<span style="color: #27ae60;">Logged out successfully</span>';
                    setTimeout(() => location.reload(), 1000);
                });
            } else {
                document.getElementById('login-status').innerHTML = '<span style="color: #f39c12;">No active session</span>';
            }
        }
    </script>
</body>
</html>
