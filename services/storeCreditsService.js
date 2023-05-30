const CONSTANTS = require('../config/constants');
const CommonService = require('./commonService');
/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
 * Function       : getOneStoreCredit
 * Method getOneStoreCredit is used to get available store credits.
 * @param data holds storeId.
 * @return fetched store credits.
 */
const getOneStoreCredit = async (data) => {
  // console.log("yes bro", data);
  // return true;
  let [err, creditsPerStore] = await to(CommonService.excecuteQuery('select * from credits.store_credits where store_id=:storeId;', { storeId: data }, 'SELECT'));
  return err ? TE(err.message) : creditsPerStore?.length ? creditsPerStore[0] : {};
}
module.exports.getOneStoreCredit = getOneStoreCredit;

/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
 * Function       : getCreditType
 * Method getCreditType is used to get credit per use.
 * @return fetched credit types.
 */
const getCreditType = async () => {
  let [err, creditPerUse] = await to(CommonService.excecuteQuery('select * from credits.credit_type', {}, 'SELECT'));
  return err ? TE(err.message) : creditPerUse;
}
module.exports.getCreditType = getCreditType;

/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
 * Function       : getStoreCredits
 * Method getStoreCredits is used to get available store credits.
 * @param req holds storeId.
 * @return fetched store credits.
 */
const getStoreCredits = async (data) => {
  console.log({ INFO: 'getStoreCredits function called' });
  let err, creditsPerStore, creditType, emailsLeft = 0, smsLeft = 0;
  if (data) {
    [err, creditsPerStore] = await to(getOneStoreCredit(data));
    if (err) return TE(err.message);
    if (creditsPerStore?.credits) {
      [err, creditType] = await to(getCreditType());
      if (err) { return TE(err.message); }
      if (creditType?.length) {
        for (let credit of creditType) {
          if (credit?.type === CONSTANTS.CREDITTYPES.email) { emailsLeft = Math.floor(creditsPerStore.credits / credit.credit_per_use); }
          if (credit?.type === CONSTANTS.CREDITTYPES.sms) { smsLeft = Math.floor(creditsPerStore.credits / credit.credit_per_use); }
        }
      }
    }
    return { availableCredits: creditsPerStore?.credits ? creditsPerStore.credits : 0, emailsLeft: emailsLeft, smsLeft: smsLeft };
  }
}
module.exports.getStoreCredits = getStoreCredits;

/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
* Function        : updateEmailandSmsCreditsforStore
* Function updateEmailandSmsCreditsforStore used to update store credits after email or sms was sent.
* @param data , which is used for holding store id.
* @return response of updated store credit details.
*/
const updateEmailandSmsCreditsforStore = async (data) => {
  let [creditTypeError, creditTypeSuccess] = await to(getOneCreditType(data));
  if (creditTypeError) return TE(creditTypeError.message);
  if (creditTypeSuccess?.credit_per_use) {
    let [storeCreditUpdateError, storeCreditUpdateSuccess] = await to(updateStoreCreditsAfterEmailandSms({
      creditPerUse: creditTypeSuccess.credit_per_use,
      storeId: data.storeId,
      usedCount: data.usedCount,
      type: creditTypeSuccess.type
    }
    ));
    if (storeCreditUpdateError) { return TE(storeCreditUpdateError.message); }
    return storeCreditUpdateSuccess;
  }
  return false;
}
module.exports.updateEmailandSmsCreditsforStore = updateEmailandSmsCreditsforStore;

/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
* Function        : updateStoreCreditsAfterEmailandSms
* Function updateStoreCreditsAfterEmailandSms used to decrement store credits availability.
* @param data , which is used for holding store id.
* @return response of updated store credit details.s
*/
const updateStoreCreditsAfterEmailandSms = async (data) => {
  data.usedCount = data.usedCount ? data.usedCount : 1;
  let [storeCreditUpdateError, storeCreditUpdateSuccess] = await to(CommonService.excecuteQuery('update credits.store_credits set credits=credits-(:dataPerUse) where store_id=:storeId returning *;', { storeId: data.storeId, dataPerUse: data.creditPerUse * Number(data.usedCount) }, 'UPDATE'));
  data['creditUsed'] = data.creditPerUse * Number(data.usedCount);
  if (storeCreditUpdateError) {
    data['status'] = 'FAILURE';
    let [creditLogError, creditLogSuccess] = await to(createCreditLog(data));
    if (creditLogError) { return TE(creditLogError.message); }
    return TE(storeCreditUpdateError.message);
  }
  if (storeCreditUpdateSuccess) {
    data['status'] = 'SUCCESS';
    let [creditLogError, creditLogSuccess] = await to(createCreditLog(data));
    if (creditLogError) { return TE(creditLogError.message); }
  }
  return storeCreditUpdateSuccess;
}
module.exports.updateStoreCreditsAfterEmailandSms = updateStoreCreditsAfterEmailandSms;

/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
* Function        : getOneCreditType
* Function getOneCreditType used to fine one credit type.
* @param data , which is used for holding store id.
* @return response of fetched credit type details.
*/
const getOneCreditType = async (data) => {
  let [typeError, typeSuccess] = await to(CommonService.excecuteQuery('select * from credits.credit_type where type=:type', { type: data.type }, 'SELECT'));
  return typeError ? TE(typeError.message) : typeSuccess?.length ? typeSuccess[0] : {};
}
module.exports.getOneCreditType = getOneCreditType;
/**
 * Original Author: Karthikeyan T
 * Author		      : Karthikeyan T
 * Created On     : 24/04/2023
 * Modified on    : 24/04/2023
* Function        : createCreditLog
* Function createCreditLog used to fine one credit type.
* @param data , which is used for holding store id.
* @return response of fetched credit type details.
*/
const createCreditLog = async (data) => {
  let [creditLogError, creditLogSuccess] = await to(CommonService.excecuteQuery('Insert into credits.credit_logs(store_id,type,credit_used,status,created_at,modified_at) values(:storeId,:type,:creditUsed,:status,NOW(),NOW()) returning *;', data, 'INSERT'));
  return creditLogError ? TE(creditLogError.message) : creditLogSuccess;
}
module.exports.createCreditLog = createCreditLog;

