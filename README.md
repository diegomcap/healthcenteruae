# Health & Pilates Center Assessment Portal

A web-based assessment portal for Health & Pilates Center clients. The portal provides secure access to assessment forms and manages client access through a key-based authentication system.

## Features

- Secure key-based authentication
- Admin panel for managing access keys
- Digital assessment forms for Physiotherapy and Pilates
- Email integration for sending access keys to clients

## Project Structure

- `index.html` - Landing page
- `login.html` - Authentication page
- `admin.html` - Admin panel for managing access keys
- `physiotherapy_assessment_form.html` - Physiotherapy assessment form
- `pilates_assessment_form.html` - Pilates assessment form
- `thank_you.html` - Confirmation page

## Setup

1. Clone the repository
2. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Select main branch as source
   - Save the settings
3. Your site will be available at `https://[username].github.io/[repository-name]/`

## Usage

1. Access the admin panel to generate access keys
2. Share generated keys with clients
3. Clients can use these keys to access assessment forms

## Security

- Access keys are stored in browser's localStorage
- Form submissions are handled securely through FormSubmit service
- No server-side storage of sensitive information

## License

All rights reserved. Health & Pilates Center © 2025