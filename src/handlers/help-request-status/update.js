import { param, body } from 'express-validator';
import { collections } from '../../constants/constants';
import { firebase } from '../../services/services';
import { validateSchema } from '../../utils/utils';

const validations = [
  param('helpStatusId')
    .exists()
    .isString()
    .custom(val => {
      const validuuid = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
      return validuuid.test(val);
    }),
  body('status').exists().custom(val => {
    const allowedStatuses = ['completed', 'started', 'cancelled'];

    return allowedStatuses.includes(val);
  }),
  validateSchema
];

const handler = async ({ body: { status }, params: { helpStatusId } }, res) => {
  const { database } = firebase;

  try {

    const contactSnapshot = await database.collection(collections.REQUESTER_CONTACT).doc(helpStatusId).get();
    const contactData = contactSnapshot.data();

    if (contactData) {
      await database.collection(collections.HELP_REQUEST).doc(contactData.helpRequestId).update({ status });
      return res.status(200).send(status);
    }
    return res.status(404).send('');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Unexpected Error Happened');
  }


};

export default [...validations, handler];
