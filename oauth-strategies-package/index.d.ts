// Type definitions for multi-oauth-strategies

import { Strategy as PassportStrategy } from 'passport';

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

export interface MultiOAuthStrategies {
  strategies: Strategies;
  handlers: Handlers;
  getStrategy(provider: string): PassportStrategy;
  getAllStrategies(): Strategies;
  registerStrategies(passport: any): void;
}

declare const multiOAuthStrategies: MultiOAuthStrategies;
export default multiOAuthStrategies;
