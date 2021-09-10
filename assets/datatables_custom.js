$(document).ready(function () {
  // this paginations variable stores the exclusive start keys
  let paginations = {};
  let draw = 1;
  let timeout = {};
  var filterStatus = false;
  var initial_data_request = true;
  var table = null;
  var page_no_requested_by_user = 1;
  var filteredTotalCount = 0;
  var totalCount = 0;
  var xhr_datatables_count = [];
  var datatable_data = [];
  var get_more_data = false;
  var get_more_exclusiveStartKey = null;

  // DataTable configureation
  var datatable_init_config = {
    pagingType: "simple",
    // pagingType: "listboxWithButtons",
    orderCellsTop: true,
    language: {
      info: "Showing _START_ to _END_ of Page _PAGE_",
      infoFiltered: "",
      infoEmpty: "No Records Found",
    },
    serverSide: true,
    stateSave: false,
    ajax: {
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      url: api_url,
      data: function () {
        return dataToSend();
      },
      beforeSend: function () {
        // disable the next and prev buttons
        disablePrevNextButtonDatable();
        // Here, manually add the loading message.
        $(`${datatable} > tbody`).html(
          '<tr class="odd">' +
            '<td valign="top" colspan="' +
            datatableColumns.length +
            '" class="dataTables_empty">Loading&hellip;</td>' +
            "</tr>"
        );
        abortCounting();
      },
      dataFilter: function (data) {
        data = JSON.parse(data);

        datatable_data = datatable_data.concat(data.Items);
        let paginations_lastEvaluatedKey = data.LastEvaluatedKey;

        let page_length =
          $(datatable).DataTable().page.len() == undefined
            ? pageLength
            : $(datatable).DataTable().page.len();
        if (
          datatable_data.length < page_length &&
          (data.LastEvaluatedKey != undefined || data.LastEvaluatedKey != null)
        ) {
          get_more_data = true;
          get_more_exclusiveStartKey = data.LastEvaluatedKey;
          $(datatable).DataTable().ajax.reload();
          data.Items = datatable_data;
        } else {
          let end_index = 0;
          if (datatable_data.length < page_length) {
            end_index = datatable_data.length;
          } else {
            end_index = page_length;
          }
          let has_next_page = false;
          if (
            data.LastEvaluatedKey != undefined &&
            data.LastEvaluatedKey != null
          ) {
            has_next_page = true;
          }

          data.Items = datatable_data.splice(0, end_index);
          if (datatable_data.length > 0 || has_next_page) {
            paginations_lastEvaluatedKey = (({
              SESMessageId,
              SESMessageType,
              SnsPublishTime,
            }) => ({ SESMessageId, SESMessageType, SnsPublishTime }))(
              data.Items[data.Items.length - 1]
            );
          } else {
            paginations_lastEvaluatedKey = undefined;
          }

          datatable_data = [];
          get_more_data = false;
          get_more_exclusiveStartKey = null;
        }

        if (
          data.LastEvaluatedKey != undefined &&
          data.LastEvaluatedKey != null
        ) {
          //$(datatable).DataTable().page.info().page this gives the page number before clicking the next button
          if (
            $(datatable).DataTable().page.info().page ==
              page_no_requested_by_user - 1 &&
            paginations_lastEvaluatedKey != undefined &&
            paginations_lastEvaluatedKey != null
          ) {
            paginations[page_no_requested_by_user + 1] =
              paginations_lastEvaluatedKey;
          }
        }
        $(datatable)
          .DataTable()
          .page(page_no_requested_by_user - 1);

        let total_records = data.ScannedCount;
        let filtered_records = data.Count;
        if (getFilterStatusAndFilter().filterStatus) {
          // total_records = data.Items.length;
          filtered_records = data.Items.length;
        }
        if (
          paginations_lastEvaluatedKey != undefined &&
          paginations_lastEvaluatedKey != null
        ) {
          total_records *= 2;
          filtered_records *= 2;
          total_records +=
            ($(datatable).DataTable().page.info().page + 2) *
            $(datatable).DataTable().page.len();
          filtered_records +=
            ($(datatable).DataTable().page.info().page + 2) *
            $(datatable).DataTable().page.len();
        } else {
          total_records +=
            $(datatable).DataTable().page.info().page *
            $(datatable).DataTable().page.len();
          filtered_records +=
            $(datatable).DataTable().page.info().page *
            $(datatable).DataTable().page.len();
        }

        // format data items to return empty string for data.Items.*.Time if Time key is not returned by server
        data.Items = formatDataItems(data.Items);
        data = {
          draw: draw,
          recordsTotal: total_records,
          recordsFiltered: filtered_records,
          data: data.Items,
        };
        if (!get_more_data) {
          updateCount();
        }

        draw++;

        return JSON.stringify(data);
      },
    },
    dom: "liptip",
    scrollY: datatableMaxHeight,
    ordering: false,
    scrollX: true,
    scrollCollapse: tableHeightCollapseOnFewData,
    lengthMenu: lengthMenu,
    processing: true,
    pageLength: pageLength,
    columns: datatableColumns,
    fnRowCallback: function (nRow, aData, iDisplayIndex) {
      var oSettings = this.fnSettings();
      $("td:first", nRow).html(oSettings._iDisplayStart + iDisplayIndex + 1);
      return nRow;
    },
    drawCallback: function (settings) {
      $(".paginate_button.previous:not(.disabled) a").on("click", function () {
        page_no_requested_by_user =
          table.page.info().page > 0 ? table.page.info().page : 0;
      });
      $(".paginate_button.next:not(.disabled) a").on("click", function () {
        page_no_requested_by_user = table.page.info().page + 2;
      });

      try{
        $(datatable).DataTable().columns.adjust();
      }
      catch(err){
        console.log(err)
      }
    },
  };

  function formatDataItems(data_items) {
    data_items.map((val) => {
      if (!("Time" in val && "time" in val)) {
        val.Time = { S: "" };
        return val;
      }
    });
    return data_items;
  }

  function disablePrevNextButtonDatable() {
    $(".paginate_button.previous:not(.disabled)").addClass("disabled");
    $(".paginate_button.next:not(.disabled)").addClass("disabled");
  }
  $("#search_form").submit(function (event) {
    clearFilter();
    setFormState();
    $("#show_requested_data_div").show("slow");
    if (initial_data_request || table == null) {
      paginations = {};
      table = $(datatable).DataTable(datatable_init_config);
      initial_data_request = false;
      
    } else {
      paginations = {};
      page_no_requested_by_user = 1;
      table.clear();
      table.page(0).draw();
    }
    $(datatable).DataTable()
      .columns.adjust();
    $(datatable).DataTable()
       .columns.adjust()
       .fixedColumns().relayout();
       $(datatable).DataTable()
      .scroller.measure();
      $(datatable).DataTable()
      .columns.adjust()
      .responsive.recalc();
    event.preventDefault();
     
  });

  function updateCountRecords(is_loading = false, is_filtered = false) {
    var table_count_div = $("#table_count_display");
    var msg = `<div class="fa-1x"><i class="fas fa-spinner fa-pulse"></i></div>`;

    if (!is_loading) {
      msg = `<div class="col-md-3"><label class="h6 text-break">Total Data: <b>${totalCount}</b></label></div>`;
      if (is_filtered) {
        msg += `<div class="col-md-8"><label class="h6 text-break">Data Filtered out of Total Data: <b>${filteredTotalCount}</b></label></div>`;
      }
    }
    if (Number.isNaN(totalCount) || Number.isNaN(filteredTotalCount)) {
      var msg = `<div class="fa-1x"><i class="fas fa-spinner fa-pulse"></i> Taking longer than usual ... </div>`;
      updateCount();
    }
    table_count_div.html(msg);
  }

  function updateCount() {
    filteredTotalCount = 0;
    totalCount = 0;
    var api_data = dataToSend(true);
    updateCountRecords(true, false);
    ajaxCallToCount(api_data, { filteredTotalCount: 0, totalCount: 0 }, () => {
      updateCountRecords(false, getFilterStatusAndFilter().filterStatus);
    });
  }
  async function ajaxCallToCount(
    api_data,
    initialCount,
    functionToRunAfterCount
  ) {
    var ajax_func = () => {
      const temp = $.ajax({
        type: "POST",
        async: true, // set async false to wait for previous response
        url: api_url,
        dataType: "json",
        contentType: "application/json; charset=utf",
        data: api_data,
        success: function (data) {
          initialCount.filteredTotalCount += data.Count;
          initialCount.totalCount += data.ScannedCount;
          if (data.LastEvaluatedKey != undefined) {
            api_data = JSON.parse(api_data);
            api_data.ExclusiveStartKey = data.LastEvaluatedKey;
            ajaxCallToCount(
              JSON.stringify(api_data),
              initialCount,
              functionToRunAfterCount
            );
          } else {
            filteredTotalCount = initialCount.filteredTotalCount;
            totalCount = initialCount.totalCount;
            functionToRunAfterCount();
          }
        },
      });
      xhr_datatables_count.push(temp);
    };

    await ajax_func();
  }
  function clearFilter() {
    $("#filterbySubject").val("");
    $("#filterbySender").val("");
    $("#filterbyDestination").val("");
    clearFilterState();
  }
  function getFilterStatusAndFilter() {
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
    return { filterStatus: filterStatus, filter: filter };
  }

  function getExclusiveStartKey() {
    let exclusiveStartKey = undefined;
    if (paginations[page_no_requested_by_user] != undefined) {
      try {
        exclusiveStartKey = paginations[page_no_requested_by_user];
      } catch (e) {
        exclusiveStartKey = undefined;
      }
    }
    return exclusiveStartKey;
  }

  function dataToSend(count = false) {
    const { filterStatus, filter } = getFilterStatusAndFilter();
    let limit = $(datatable).DataTable().page.len();
    let exclusiveStartKey = getExclusiveStartKey();
    if (get_more_data) {
      if (get_more_exclusiveStartKey != null) {
        exclusiveStartKey = get_more_exclusiveStartKey;
        limit = undefined;
      } else {
        exclusiveStartKey = getExclusiveStartKey();
        limit = $(datatable).DataTable().page.len();
      }
    } else {
      if (count) {
        exclusiveStartKey = undefined;
      }
    }

    return JSON.stringify(
      apiDataObject(
        limit,
        filterStatus ? filter : undefined,
        exclusiveStartKey,
        count ? count : undefined
      )
    );
  }
  function abortCounting() {
    // add the loading msg for total count
    if (xhr_datatables_count.length > 0) {
      xhr_datatables_count.forEach((xhr_datatable) => {
        xhr_datatable.abort();
      });
    }
  }

  // call this function to enable header search on 3rd, 4th and 5th column.
  function headerSearch() {
    // Setup - add a text input to each footer cell
    $(`${datatable} thead tr`).clone(true).appendTo(`${datatable} thead`);
    $(`${datatable} thead tr:eq(1) th`).each(function (i) {
      var id = "filterbySubject";
      if (i == 4) {
        id = "filterbySender";
      } else if (i == 5) {
        id = "filterbyDestination";
      }
      if (i == 3 || i == 4 || i == 5) {
        var title = $(this).text();
        $(this).html(
          '<input id="' +
            id +
            '" type="text" class="form-control form-control-sm deleteable" placeholder="Search: ' +
            title +
            '" />'
        );

        $("input", this).on("keyup", function () {
          // Clear the timeout if it has already been set.
          // This will prevent the previous task from executing
          // if it has been less than <MILLISECONDS>
          clearTimeout(timeout[i]);

          setFilterState(getFilterStatusAndFilter().filter);

          // Make a new timeout set to go off in 1000ms (1 second)
          timeout[i] = setTimeout(function () {
            if (table.column(i).search() !== this.value) {
              filterStatus = true;
              paginations = {};
              abortCounting();
              page_no_requested_by_user = 1;
              table.clear();
              table.page(0).draw();
            }
          }, 1000);
        });
      } else {
        $(this).html("");
      }
    });
  }
  headerSearch();
});
