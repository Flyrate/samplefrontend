var api_url = "https://r0sh9ji2ge.execute-api.us-east-1.amazonaws.com/test";
var api_tableName = "SMTPDeliveryNotifications";
var api_consistentRead = false;
var api_indexName = "SESMessageType-Index";
var filterStatus = false;
var toFilter = true;
var api_projectionExpression_onCount = "SESMessageType";

/**
 *
 * @param  {...any} args
 * @returns
 */
function apiDataObject(
  limit = undefined,
  filter = undefined,
  exclusiveStartKey = undefined,
  count = undefined
) {
  let api_keyConditionExpression =
    "(SESMessageType = :SESMessageType AND SnsPublishTime BETWEEN :date1 AND :date2)";
  let api_expressionAttributeValues = {
    ":SESMessageType": { S: document.getElementById("action").value },
    ":date1": { S: document.getElementById("from").value },
    ":date2": { S: document.getElementById("to").value },
  };
  let api_filterExpression = [];
  if (filter != undefined) {
    for (const [key, value] of Object.entries(filter)) {
      api_filterExpression.push(` contains(${key}, :${key}) `);
      api_expressionAttributeValues[`:${key}`] = { S: value };
    }
  }

  let data = {
    TableName: api_tableName,
    ConsistentRead: api_consistentRead,
    IndexName: api_indexName,
    KeyConditionExpression: api_keyConditionExpression,
    ExpressionAttributeValues: api_expressionAttributeValues,
    // ProjectionExpression: "Subject",
  };
  if (api_filterExpression.length > 0) {
    data["FilterExpression"] = api_filterExpression.join(" AND ");
  }
  if (exclusiveStartKey != undefined) {
    data["ExclusiveStartKey"] = exclusiveStartKey;
  }
  if (limit != undefined) {
    data["Limit"] = limit;
  }
  if (count == true) {
    data["ProjectionExpression"] = api_projectionExpression_onCount;
  }
  return data;
}
