// variables required for making the api_call 
// old api
var api_url = "https://r0sh9ji2ge.execute-api.us-east-1.amazonaws.com/test";
// var api_url =
//   "https://dyxuixpp0d.execute-api.ap-south-1.amazonaws.com/test/getinformation";
var api_tableName = {
  delivery: "SMTPDeliveryNotifications",
  complaint: "SMTPComplaintNotifications",
  bounce: "SMTPBounceNotifications",
};
var api_consistentRead = false;
var api_indexName = "SESMessageType-Index";
var filterStatus = false;
var toFilter = true;
var api_projectionExpression_onCount = "SESMessageType";

// this file contains the root environment that is required for both the csv and datatables

// maintain the state of the form
// this is to ensure that the state of form is changed only when the request data button is pressed
var form_state = { from_date: null, to_date: null, action: null };
function setFormState() {
  form_state["from"] = document.getElementById("from").value;
  form_state["to"] = document.getElementById("to").value;
  form_state["action"] = document.getElementById("action").value;
}
function getFormState(info_to_get) {
  return form_state[info_to_get];
}

function getAllFormState() {
  return form_state;
}

// maintaiun the state of the filter fields
// this is to ensure, the filter state is changed only when user changes the input and not programatically
var filter_state = {};
function setFilterState(filterObject) {
  for (const [key, value] of Object.entries(filterObject)) {
    if (value != "" && value != undefined && value != null) {
      filter_state[key] = value;
    }
  }
  if (Object.keys(filterObject).length == 0) {
    clearFilterState();
  }
}
function clearFilterState() {
  filter_state = {};
}

function getAllFilterState() {
  return filter_state;
}
function getFilterState(filter_info_to_get) {
  return filter_state[filter_info_to_get];
}

Date.prototype.toDateInputValue = function () {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};
// set the default value of the date as todays date on the form
function setTodayAsDefaultFromAndToDate() {
  document.getElementById("from").value = new Date().toDateInputValue();
  document.getElementById("to").value = new Date().toDateInputValue();
}

setTodayAsDefaultFromAndToDate();

function serverDateToLocalDate(server_date) {
  return server_date;
  // you can conver the local date to server date from here, please write the code something like below
  // the whole application will run smoothly by just changing the datetime conversion in two functions serverDateToLocalDate and localDateToServerDate
  // Note: Please be careful about date format

  // return moment.utc(server_date, "YYYY-MM-DD HH:mm:ss").local().format("YYYY-MM-DD HH:mm:ss");
}

function localDateToServerDate(local_date) {
  return local_date;
  // you can conver the local date to server date from here, please write the code something like below
  // the whole application will run smoothly by just changing the datetime conversion in two functions serverDateToLocalDate and localDateToServerDate
  // Note: Please be careful about date format

  // return moment(local_date).utc().format("YYYY-MM-DD HH:mm:ss");
}
/**
 *
 * @param {number || undefined} limit => no of data of get at a time, if you want to get the maximum data that dynamoDB can return then set it to undefined.
 * @param {filter dictionary || undefined} filter => dictionay of filter i.e. {"Subject": "subject to filter", ...}. If no filter applied then set it to undefined.
 * @param {LastEvaluatedKey || undefined} exclusiveStartKey => exclusiveStartKey if present for the data to fetch, if there is no exclusiveStartKey then set it to undefined
 * @param { true || false || undefined } count => set this true if you want to get only the count and no other information
 * @returns
 */
function apiDataObject(
  limit = undefined,
  filter = undefined,
  exclusiveStartKey = undefined,
  count = undefined
) {
  // api key condition for the request
  let api_keyConditionExpression =
    "(SESMessageType = :SESMessageType AND SnsPublishTime BETWEEN :date1 AND :date2)";
  // expression attribute values for the request

  let api_expressionAttributeValues = {
    ":SESMessageType": { S: getFormState("action") },
    ":date1": { S: localDateToServerDate(getFormState("from")) },
    ":date2": { S: localDateToServerDate(getFormState("to")) },
    // ":date1": { S: getFormState("from") },
    // ":date2": { S: getFormState("to") },
  };
  // set filter expression to blank
  let api_filterExpression = [];
  // check if filter is given
  // if filter object is given then set the values of filter expression
  if (filter != undefined) {
    for (const [key, value] of Object.entries(filter)) {
      api_filterExpression.push(` contains(${key}, :${key}) `);
      api_expressionAttributeValues[`:${key}`] = { S: value };
    }
  }
  // basic data to pass to the api
  let data = {
    TableName: api_tableName[getFormState("action").toLowerCase()],
    ConsistentRead: api_consistentRead,
    IndexName: api_indexName,
    KeyConditionExpression: api_keyConditionExpression,
    ExpressionAttributeValues: api_expressionAttributeValues,
    // ProjectionExpression: "Subject",
  };
  // if filter object is given then filter expression length will be more than 0, so include it in the data
  // look at the code above trhe data to pass declaration for clarification.
  if (api_filterExpression.length > 0) {
    data["FilterExpression"] = api_filterExpression.join(" AND ");
  }
  // if exclusiveStartKey is given then set it on the data  to pass
  if (exclusiveStartKey != undefined) {
    data["ExclusiveStartKey"] = exclusiveStartKey;
  }
  // check if we have to just count the data or get all the results
  if (count == true) {
    // if we have to count the data then just get a single column form result, we need to get atleast 1 column
    // we can do this by defining the projectionExpression
    // we have defined the column to get on the api_projectionExpression_onCount variable defined above.addEventListener
    // This is done to reduce the network latency, as getting all the columns will require more columns
    // In the future it is advisiable to use the column with the less size of data
    data["ProjectionExpression"] = api_projectionExpression_onCount;
  } else {
    // if count is true then we can just ignore the limit
    // but if it is false then we have to get the data under the limit provided by the user
    if (limit != undefined) {
      data["Limit"] = limit;
    }
  }
  // return the data object to pass to the api
  return data;
}
