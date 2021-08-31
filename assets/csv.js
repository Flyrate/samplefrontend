$(document).ready(function () {
  let csv_data = [];
  let csv_loaded_data_count = 0;
  let serial_no = 1;
  var csv_filteredTotalCount = 0;
  var csv_totalCount = 0;
  let csv_export_error_msg =
    "Please refresh the page and try again. If the task is not completed after few retries contact the Genese Solutions.";

  var filterStatus = false;
  //   the value of this let will be the latest ajax call made
  let xhr = null;
  let xhr_count = null;

  $("#csv_export_btn").on("click", () => {
    $("#csv_export_btn").hide("fast", "swing");
    $("#csv_export_btn_col").hide("fast", "swing");
    $("#csv_cancel_export_btn").show("slow", "swing");
    csvExport();
  });
  $("#csv_cancel_export_btn").on("click", () => {
    alert("Export Cancled By User");
    cancelCSVExport();
  });

  function data(to_count = false) {
    const filterbySubject = $("#filterbySubject").val().trim();
    const filterbySender = $("#filterbySender").val().trim();
    const filterbyDestination = $("#filterbyDestination").val().trim();

    var filter = {};
    filterStatus = false;

    if (filterbySubject != "") {
      filterStatus = true;
      filter["Subject"] = filterbySubject;
    }

    if (filterbySender != "") {
      filterStatus = true;
      filter["SESSenderAddress"] = filterbySender;
    }

    if (filterbyDestination != "") {
      filterStatus = true;
      filter["SESDestinationAddress"] = filterbyDestination;
    }

    let exclusiveStartKey = undefined;

    const page_length = undefined;
    return apiDataObject(
      page_length,
      filterStatus ? filter : undefined,
      exclusiveStartKey,
      to_count
    );
  }

  function apiCall(api_data_object) {
    xhr = $.ajax({
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: api_url,
      data: JSON.stringify(api_data_object),
      complete: function (data) {
        // console.log(data);
      },
      success: async function (data) {
        let items = [];
        for (let [key, value] of Object.entries(data.Items)) {
          value["sn"] = serial_no;
          serial_no++;
          items.push(value);
        }
        csv_data = csv_data.concat(items);
        csv_loaded_data_count += data.Count;
        if (data.LastEvaluatedKey != undefined) {
          api_data_object["ExclusiveStartKey"] = data.LastEvaluatedKey;
          setProgressBarPercentage(
            Math.round((csv_loaded_data_count / csv_totalCount) * 100),
            false
          );

          apiCall(api_data_object);
        } else {
          setProgressBarPercentage(100, false);
          await sleep(1000);
          let filename = Object.values(
            api_data_object.ExpressionAttributeValues
          )
            .map((obj) => obj.S)
            .join("__");
          const r = window.prompt(
            "Enter the file name (Suggested File name is already entered) : ",
            filename
          );
          if (r) {
            exportArrayToCSV(filename);
          } else {
            alert("Download Cancled By User");
            cancelCSVExport();
          }
        }
      },
      error: function (xhr, ajaxOptions, thrownError) {
        if (thrownError != "abort") {
          alert(csv_export_error_msg);
          cancelCSVExport();
        }
        return false;
      },
    });
  }

  function cancelCSVExport() {
    setProgressBarPercentage(0);
    $("#csv_cancel_export_btn").hide("fast", "swing");
    $("#csv_export_btn_col").show("fast", "swing");
    $("#csv_export_btn").show("slow", "swing");
    $("#csv_downloading_div").hide("slow", "swing");
    csv_data = [];
    if (xhr != null) {
      xhr.abort();
    }
    if (xhr_count != null) {
      xhr_count.abort();
    }
  }

  function exportArrayToCSV(filename = "Mailing Data") {
    let csvContent =
      "data:text/csv;charset=utf-8," + csv_data_header.join(",") + "\r\n";
    // "SN", "Send Date and Time", "From", "To", "Message Type", "Source IP", "SMTP Response"]
    csv_data.forEach(function (row) {
      row = getRowToExportFromExistingRow(row);

      row = row.join(",");
      csvContent += row + "\r\n";
    });
    console.log("All the rows with erorr and the erorrs as follow : ");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);

    link.setAttribute("download", filename + ".csv");
    document.body.appendChild(link); // Required for FF

    link.click();
    cancelCSVExport();
  }

  function setCsvLoadingMessage() {
    let msg = "";
    for (const [key, value] of Object.entries(getAllFormState())) {
      const user_key = jsonKeyToUserMessage(key);
      //   msg += `${user_key} = ${value}<br>`;
      if (user_key != undefined) {
        msg += `<div class="col-md-4"><label class="text-break">${user_key}: <b>${value}</b></label></div>`;
      }
    }
    var no_of_filters = 0;

    for (const [key, value] of Object.entries(getAllFilterState())) {
      const user_key = jsonKeyToFilterMessage(key);
      //   msg += `${user_key} = ${value}<br>`;
      if (user_key != undefined) {
        no_of_filters++;
        if (no_of_filters == 1) {
          msg += `<div class="col-md-12"><h6 class="text-break">Filter By: </h6></div>`;
        }
        msg += `<div class="col-md-4"><label class="text-break">${user_key}: <b>${value}</b></label></div>`;
      }
    }

    $("#csv_processing_message").html(msg);
    $("#csv_downloading_div").show("slow", "swing");
  }

  async function csvExport() {
    csv_data = [];
    setProgressBarPercentage(0);
    serial_no = 1;
    setCsvLoadingMessage();
    csv_filteredTotalCount = 0;
    csv_totalCount = 0;
    apiCallCountAndCSV(data(true), data());
  }

  function apiCallCountAndCSV(api_count_data, api_csv_data) {
    setProgressBarPercentage();
    (async () => {
      let promise = new Promise((res, rej) => {
        xhr_count = $.ajax({
          type: "POST",
          async: true, // set async false to wait for previous response
          url: api_url,
          dataType: "json",
          contentType: "application/json; charset=utf",
          data: JSON.stringify(api_count_data),
          success: function (data) {
            csv_filteredTotalCount += data.Count;
            csv_totalCount += data.ScannedCount;
            if (data.LastEvaluatedKey != undefined) {
              api_count_data.ExclusiveStartKey = data.LastEvaluatedKey;
              apiCallCountAndCSV(api_count_data, api_csv_data);
            } else {
              apiCall(api_csv_data);
              setProgressBarPercentage(5, false);
            }
          },
          error: function (xhr, ajaxOptions, thrownError) {
            if (thrownError != "abort") {
              alert(csv_export_error_msg);
              cancelCSVExport();
            }
            return false;
          },
        });
      });
      await promise;
    })();
  }

  function jsonKeyToUserMessage(jsonKey) {
    if (jsonKey.toUpperCase() == "action".toUpperCase()) {
      return "Type";
    } else if (jsonKey.toUpperCase() == "from".toUpperCase()) {
      return "From Date";
    } else if (jsonKey.toUpperCase() == "to".toUpperCase()) {
      return "To Date";
    }
  }
  function jsonKeyToFilterMessage(jsonKey) {
    if (jsonKey.toUpperCase() == "Subject".toUpperCase()) {
      return "Subject";
    } else if (jsonKey.toUpperCase() == "SESSenderAddress".toUpperCase()) {
      return "From";
    } else if (jsonKey.toUpperCase() == "SESDestinationAddress".toUpperCase()) {
      return "To";
    }
  }
  function setProgressBarPercentage(
    progressBarPercentage = 100,
    loading = true
  ) {
    const progressBar = $("#csv_progress_bar");
    if (loading) {
      progressBar.text("Preparing to Export ...");
      progressBar.removeClass("bg-success");
      progressBar.addClass("bg-warning");
      progressBar
        .attr("aria-valuenow", progressBarPercentage)
        .css("width", progressBarPercentage + "%");
    } else {
      progressBar.text(progressBarPercentage + "%");
      progressBar.removeClass("bg-warning");
      progressBar.addClass("bg-success");
      progressBar
        .attr("aria-valuenow", progressBarPercentage)
        .css("width", progressBarPercentage + "%");
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});
