// Type definitions for multi-oauth-strategies

import { Strategy as PassportStrategy } from 'passport';
import { Application, RequestHandler } from 'express';
import { SessionOptions } from 'express-session';

export interface OAuthProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  email?: string;
  picture?: string;
  [key: string]: any;
}

export interface StrategyOptions {
  clientID?: string;
  clientSecret?: string;
  consumerKey?: string;
  consumerSecret?: string;
  callbackURL?: string;
  [key: string]: any;
}

export interface Strategies {
  google: PassportStrategy;
  facebook: PassportStrategy;
  github: PassportStrategy;
  linkedin: PassportStrategy;
  twitter: PassportStrategy;
  instagram: PassportStrategy;
  reddit: PassportStrategy;
}

export interface Handlers {
  handleOAuthCallback(
    provider: string,
    profile: OAuthProfile,
    accessToken: string,
    refreshToken?: string
  ): Promise<any>;
}

export interface InitializePassportResult {
  passport: any;
  initialize: () => void;
  session: () => void;
}

export interface InitializeOAuthResult {
  passport: any;
  sessionMiddleware: any;
  message: string;
}

export interface AuthenticateOptions {
  scope?: string | string[];
  duration?: string;
  failureRedirect?: string;
  failureMessage?: boolean;
  [key: string]: any;
}

export interface MultiOAuthStrategies {
  strategies: Strategies;
  handlers: Handlers;
  
  /**
   * Setup Passport with OAuth strategies (manual approach)
   */
  setupPassport(passportInstance: any, userModel: any, providers?: string[]): any;
  
  /**
   * Initialize Passport middleware automatically
   */
  initializePassport(app: Application, sessionMiddleware?: any): InitializePassportResult;
  
  /**
   * Complete OAuth setup with automatic passport initialization
   */
  initializeOAuth(app: Application, userModel: any, providers?: string[], sessionConfig?: Partial<SessionOptions>): InitializeOAuthResult;
  
  /**
   * Get authentication middleware for a provider
   */
  authenticate(provider: string, options?: AuthenticateOptions): RequestHandler;
  
  /**
   * Authentication middleware with pre-configured defaults
   */
  authenticateWithDefaults(provider: string, customOptions?: AuthenticateOptions): RequestHandler;
  
  /**
   * Callback authentication middleware with error handling
   */
  authenticateCallback(provider: string, failureRedirect?: string, customOptions?: AuthenticateOptions): RequestHandler;
  
  getStrategy(provider: string): PassportStrategy;
  getAllStrategies(): Strategies;
  registerStrategies(passport: any): void;
}

declare const multiOAuthStrategies: MultiOAuthStrategies;
export default multiOAuthStrategies;
