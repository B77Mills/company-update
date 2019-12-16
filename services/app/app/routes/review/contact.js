import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { queryManager } from 'ember-apollo-client';
import companyQuery from '../../gql/queries/review/contact-company';

export default Route.extend({
  apollo: queryManager(),

  async model() {
    const { submission, company: { hash } } = this.modelFor('review');
    const company = await this.apollo.query({ query: companyQuery, variables: { input: { hash } } }, 'contentHash');
    const { payload: { add, remove, update } } = submission;

    const original = get(company, 'publicContacts.edges').map(({ node }) => {
      const { id, firstName, lastName, title, primaryImage } = node;
      return { id, firstName, lastName, title, primaryImage };
    });

    const contacts = original.reduce((arr, contact) => {
      const { id } = contact;
      const updated = update.find((u) => u.id === id);
      if (updated) {
        return [
          ...arr,
          {
            original: contact,
            updated: { ...contact, ...updated },
            payload: { enabled: true, updated: true, fields: { ...updated } },
          },
        ];
      }
      if (remove.includes(id)) {
        return [
          ...arr,
          {
            original: contact,
            payload: { enabled: true, removed: true },
          },
        ];
      }
      return [ ...arr, { original: contact, payload: { enabled: false } } ];
    }, []);
    add.forEach((contact) => contacts.push({
      updated: contact,
      payload: { enabled: true, added: true, fields: contact },
    }));
    return { submission, company, contacts };
  },

});
