$(document).ready(function () {
  var api_data_object = {
    TableName: "SMTPDeliveryNotifications",
    ConsistentRead: false,
    IndexName: "SESMessageType-Index",
    KeyConditionExpression: "SESMessageType = :val",
    ExpressionAttributeValues: { ":val": { S: "Delivery" } },
  };
  xhr = $.ajax({
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    url: "https://r0sh9ji2ge.execute-api.us-east-1.amazonaws.com/test",
    data: JSON.stringify(api_data_object),
    complete: function (data) {
      // console.log(data);
    },
    success: async function (data) {
      console.log(data);
    },
  });
});
