import Controller from '@ember/controller';
import { inject } from '@ember/service';
import ActionMixin from '@base-cms/company-update-app/mixins/action';

const { warn } = console;

export default Controller.extend(ActionMixin, {
  username: null,
  password: null,
  errorMessage: null,
  session: inject(),

  actions: {
    async authenticate() {
      this.startAction();
      this.set('errorMessage', null);
      const { username, password } = this.getProperties('username', 'password');
      try {
        await this.get('session').authenticate('authenticator:application', username, password);
      } catch (e) {
        warn(e.errors[0].message);
        if (e.errors) {
          this.set('errorMessage', e.errors[0].message);
        } else {
          this.set('errorMessage', e.message);
        }
      } finally {
        this.endAction();
      }
    }
  }
});
