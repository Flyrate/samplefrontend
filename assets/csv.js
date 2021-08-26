$(document).ready(function () {
  $.getScript("assets/env/root_env.js", function () {
    $.getScript("assets/env/csv_env.js", function () {
      let csv_data = [];
      let csv_paginations = null;

      let pg = 1;
      let serial_no = 1;

      var filterStatus = false;
      //   the value of this let will be the latest ajax call made
      let xhr = null;

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

      let data = () => {
        if (
          $("#filterbySubject").val().trim() == "" &&
          $("#filterbySender").val().trim() == "" &&
          $("#filterbyDestination").val().trim() == ""
        ) {
          filterStatus = false;
        } else {
          filterStatus = "True";
        }
        var data = {
          action: $("#action :selected").val(),
          date1: $("#from").val(),
          date2: $("#to").val(),
          filterStatus: filterStatus,
          Numberofdata: csv_length,
        };
        if ($("#filterbySubject").val().trim() != "") {
          data["filterbySubject"] = $("#filterbySubject").val().trim();
        }

        if ($("#filterbySender").val().trim() != "") {
          data["filterbySender"] = $("#filterbySender").val().trim();
        }

        if ($("#filterbyDestination").val().trim() != "") {
          data["filterbyDestination"] = $("#filterbyDestination").val().trim();
        }
        return data;
      };

      function apiCall(api_data_object) {
        xhr = $.ajax({
          type: "POST",
          dataType: "json",
          contentType: "application/json",
          url: "https://ulo6w8cpv2.execute-api.us-east-1.amazonaws.com/test/test",
          data: JSON.stringify(api_data_object),
          complete: function (data) {
            // console.log(data);
          },
          success: async function (data) {
            console.log(pg);
            console.log(data);
            let items = [];
            for (let [key, value] of Object.entries(data.Items)) {
              value["sn"] = serial_no;
              serial_no++;
              items.push(value);
            }
            csv_data = csv_data.concat(items);
            csv_paginations = data.Paginations;
            if (data.LastEvaluatedKey != undefined) {
              api_data_object["LastEvaluatedKey"] = data.LastEvaluatedKey;
              setProgressBarPercentage(
                Math.round((pg / Object.keys(csv_paginations).length) * 100)
              );
              pg++;
              apiCall(api_data_object);
            } else {
              setProgressBarPercentage(100);
              await sleep(1000);
              const r = confirm(
                "CSV file ready to downlod. Please confirm to download it."
              );
              if (r) {
                exportArrayToCSV();
              } else {
                alert("Download Cancled By User");
                cancelCSVExport();
              }
            }
          },
          error: function (xhr, ajaxOptions, thrownError) {
            if (thrownError != "abort") {
              alert(
                "Please refresh the page and try again. If the task is not completed after few retries contact the Genese Solutions."
              );
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
        if (xhr != null) {
          xhr.abort();
        }
      }

      function exportArrayToCSV() {
        let csvContent =
          "data:text/csv;charset=utf-8," + csv_data_header.join(",") + "\r\n";
        // "SN", "Send Date and Time", "From", "To", "Message Type", "Source IP", "SMTP Response"]
        csv_data.forEach(function (row) {
          row = getRowToExportFromExistingRow(row);
          row = row.join(",");
          csvContent += row + "\r\n";
        });

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
        cancelCSVExport();
      }

      function setCsvLoadingMessage(data) {
        let msg = "";
        for (const [key, value] of Object.entries(data)) {
          const user_key = jsonKeyToUserMessage(key);
          //   msg += `${user_key} = ${value}<br>`;
          if (user_key != undefined) {
            msg += `<div class="col-md-4"><label class="text-break">${user_key}: <b>${value}</b></label></div>`;
          }
        }
        var no_of_filters = 0;
        for (const [key, value] of Object.entries(data)) {
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
        console.log(msg);
      }

      async function csvExport() {
        csv_data = [];
        csv_paginations = null;
        setProgressBarPercentage(0);
        pg = 1;
        serial_no = 1;
        setCsvLoadingMessage(data());
        return await apiCall(data());
      }

      function jsonKeyToUserMessage(jsonKey) {
        if (jsonKey == "action") {
          return "Type";
        } else if (jsonKey == "date1") {
          return "Date From";
        } else if (jsonKey == "date2") {
          return "Date To";
        }
      }
      function jsonKeyToFilterMessage(jsonKey) {
        if (jsonKey == "filterbySubject") {
          return "Subject";
        } else if (jsonKey == "filterbySender") {
          return "From";
        } else if (jsonKey == "filterbyDestination") {
          return "To";
        }
      }
      function setProgressBarPercentage(progressBarPercentage) {
        const progressBar = $("#csv_progress_bar");
        progressBar.text(progressBarPercentage + "%");
        progressBar
          .attr("aria-valuenow", progressBarPercentage)
          .css("width", progressBarPercentage + "%");
      }

      function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });
  });
});
