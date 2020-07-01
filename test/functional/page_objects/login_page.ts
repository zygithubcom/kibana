/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FtrProviderContext } from '../ftr_provider_context';

export function LoginPageProvider({ getService, getPageObjects }: FtrProviderContext) {
  const testSubjects = getService('testSubjects');
  const log = getService('log');
  const find = getService('find');
  const { common } = getPageObjects(['common']);

  const regularLogin = async (user: string, pwd: string) => {
    await testSubjects.setValue('loginUsername', user);
    await testSubjects.setValue('loginPassword', pwd);
    await testSubjects.click('loginSubmit');
    await find.waitForDeletedByCssSelector('.kibanaWelcomeLogo');
    await find.byCssSelector('[data-test-subj="kibanaChrome"]', 60000); // 60 sec waiting
  };

  const samlLogin = async (user: string, pwd: string) => {
    try {
      await find.clickByButtonText('Login using SAML');
      await find.setValue('input[name="email"]', user);
      await find.setValue('input[type="password"]', pwd);
      await find.clickByCssSelector('.auth0-label-submit');
      await find.byCssSelector('[data-test-subj="kibanaChrome"]', 60000); // 60 sec waiting
    } catch (err) {
      log.debug(`${err} \nFailed to find Auth0 login page, trying the Auth0 last login page`);
      await find.clickByCssSelector('.auth0-lock-social-button');
    }
  };

  class LoginPage {
    async login(user: string, pwd: string) {
      if (
        process.env.VM === 'ubuntu18_deb_oidc' ||
        process.env.VM === 'ubuntu16_deb_desktop_saml'
      ) {
        await samlLogin(user, pwd);
        return;
      }

      await regularLogin(user, pwd);
    }

    async logoutLogin(user: string, pwd: string) {
      await this.logout();
      await common.sleep(3002);
      await this.login(user, pwd);
    }

    async logout() {
      await testSubjects.click('userMenuButton');
      await common.sleep(500);
      await testSubjects.click('logoutLink');
      log.debug('### found and clicked log out--------------------------');
      await common.sleep(8002);
    }
  }

  return new LoginPage();
}
