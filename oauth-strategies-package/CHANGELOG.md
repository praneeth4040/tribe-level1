# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-10-26

### Added
- Initial release with support for 7 OAuth providers:
  - Google OAuth 2.0
  - Facebook OAuth 2.0
  - GitHub OAuth 2.0
  - LinkedIn OAuth 2.0
  - Twitter OAuth 1.0a
  - Instagram OAuth 2.0
  - Reddit OAuth 2.0
- Universal OAuth handler for automatic user creation, updating, and account linking
- Automatic user management with email-based account linking
- TypeScript type definitions
- Comprehensive documentation and examples
- Environment variable-based configuration
- Token storage support (access and refresh tokens)
- Multi-provider account linking support

### Features
- Zero-configuration setup (just provide credentials)
- Mongoose schema integration
- Passport.js compatible
- Production-ready security best practices
- Token management (access & refresh)
- Automatic profile picture extraction
- Email-based account linking

## Future Releases

### [1.1.0] - Planned
- Discord OAuth support
- Twitch OAuth support
- Spotify OAuth support
- Apple Sign In support
- Custom provider support

### [2.0.0] - Planned
- OAuth token refresh automation
- Provider profile sync
- Rate limiting utilities
- Session management utilities
