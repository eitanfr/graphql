// @flow

import gql from 'graphql-tag';
import type {
  CreateUserType,
  LoginReturnType,
  ImpersonateReturnType,
} from '@accounts/common';
import {
  sendResetPasswordEmailMutation,
  sendVerificationEmailMutation,
  resetPasswordMutation,
  logoutMutation,
  verifyEmailMutation,
  createUserMutation,
  defaultUserFieldsFragment,
  createLoginMutation,
  createRefreshTokenMutation,
  createImpersonateMutation,
} from './graphql';

export type OptionsType = {
  graphQLClient: any,
  userFieldsFragment: string,
};

export class GraphQLClient {
  constructor(options: OptionsType = {}) {
    this.options = Object.assign({
      graphQLClient: null,
      userFieldsFragment: defaultUserFieldsFragment,
    }, options);

    this.options.userFieldsFragment = gql`${this.options.userFieldsFragment}`;

    if (!this.options.graphQLClient ||
      !this.options.graphQLClient.query ||
      !this.options.graphQLClient.mutate) {
      throw new Error('Invalid GraphQL client provided: missing \'query\' and \'mutate\' methods!');
    }
  }

  async mutate(mutation, resultField, variables) {
    return await this.options.graphQLClient.mutate({
      mutation,
      variables,
    })
      .then(({ data }) => (data[resultField]))
      .catch((e) => {
        throw new Error(e.message);
      });
  }

  async query(query, resultField, variables) {
    return await this.options.graphQLClient.query({
      query,
      variables,
    })
      .then(({ data }) => (data[resultField]))
      .catch((e) => {
        throw new Error(e.message);
      });
  }

  async loginWithPassword(user: string, password: string): Promise<LoginReturnType> {
    const loginMutation = createLoginMutation(this.options.userFieldsFragment);
    return await this.mutate(loginMutation, 'loginWithPassword', { user, password });
  }

  async impersonate(accessToken: string, username: string): Promise<ImpersonateReturnType> {
    const impersonateMutation = createImpersonateMutation(this.options.userFieldsFragment);
    return await this.mutate(impersonateMutation, 'impersonate', { accessToken, username });
  }

  async createUser(user: CreateUserType): Promise<string> {
    return await this.mutate(createUserMutation, 'createUser', { user });
  }

  async refreshTokens(accessToken: string, refreshToken: string): Promise<LoginReturnType> {
    const mutation = createRefreshTokenMutation(this.options.userFieldsFragment);
    return await this.mutate(mutation, 'refreshTokens', { accessToken, refreshToken });
  }

  async logout(accessToken: string): Promise<void> {
    return await this.mutate(logoutMutation, 'logout', { accessToken });
  }

  async verifyEmail(token: string): Promise<void> {
    return await this.mutate(verifyEmailMutation, 'verifyEmail', { token });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return await this.mutate(resetPasswordMutation, 'resetPassword', { token, newPassword });
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    return await this.mutate(sendVerificationEmailMutation, 'sendVerificationEmail', { userId, email });
  }

  async sendResetPasswordEmail(userId: string, email: string): Promise<void> {
    return await this.mutate(sendResetPasswordEmailMutation, 'sendResetPasswordEmail', { userId, email });
  }

  options: OptionsType;
}
