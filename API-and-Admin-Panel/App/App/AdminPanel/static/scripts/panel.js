var tablename;
var elemId;
var totalNum;
var currentPage = 1;
var sortSelected = ["", "", "selected"];
var isSort = false;
var isIncremented = false;

// Функция для перевода заголовков колонок с английского на казахский
function translateHeader(englishHeader) {
  const translations = {
    'Drivers': 'Жүргізушілер',
    'Vehicles': 'Көліктер',
    'Customers': 'Клиенттер',
    'Locations': 'Мекенжайлар',
    'Jobs': 'Жұмыстар',
    'Receipts': 'Чектер',
    // Drivers table
    'VehicleID': 'Көлік ID',
    'Username': 'Пайдаланушы аты',
    'Password': 'Құпиясөз',
    'FirstName': 'Аты',
    'LastName': 'Тегі',
    'DOB': 'Туған күні',
    'NINo': 'Ұлттық сәйкестендіру нөмірі',
    'DrivingLicenseNo': 'Жүргізуші куәлігінің нөмірі',
    'DrivingLicensePic': 'Жүргізуші куәлігінің суреті',
    'Address1': 'Мекенжай 1',
    'Address2': 'Мекенжай 2',
    'City': 'Қала',
    'PostCode': 'Пошта кодылар',
    'Country': 'Ел',
    'Location': 'Орналасқан жері',
    'DateCreated': 'Жасалған күні',
    'LastConnected': 'Соңғы қосылған уақыт',
    
    // Vehicles table
    'RegistrationNo': 'Тіркеу нөмірі',
    'Make': 'Өндіруші',
    'Model': 'Үлгісі',
    'Color': 'Түсі',
    'Capacity': 'Сыйымдылығы',
    'Status': 'Күйі',
    
    // Customers table
    'Email': 'Электрондық пошта',
    'Phone': 'Телефон',
    
    // Locations table
    'CustomerID': 'Клиент ID',
    
    // Jobs table
    'TrackingID': 'Бақылау ID',
    'ParcelType': 'Сәлемдеме түрі',
    'ParcelSize': 'Сәлемдеме өлшемі',
    'ParcelWeight': 'Сәлемдеме салмағы',
    'DateDue': 'Мерзімі',
    'DateDelivered': 'Жеткізілген күні',
    'DistanceTravelled': 'Жүрілген арақашықтық',
    'Picture1': 'Сурет 1',
    'Picture2': 'Сурет 2',
    'Comments': 'Түсініктемелер',
    'DriverID': 'Жүргізуші ID',
    'PickupID': 'Алу орны ID',
    'DropOffID': 'Түсіру орны ID',
    'PricePaid': 'Төленген баға',
    
    // Receipts table
    "ReceiptID": 'Чек ID',
    'JobID': 'Жұмыс ID',
    'Amount': 'Сома',
    'Picture': 'Сурет'
  };
  
  return translations[englishHeader] || englishHeader;
}

$("body").on("focus", ".datepicker_recurring_start", function () {
  $(this).datetimepicker({
    defaultDate: new Date(),
    format: "YYYY-MM-DD HH:mm:ss",
    sideBySide: true,
  });
});

function newPage(data, l1, l2) {
  currentPage = 1;
  isSort = false;
  getData(data, l1, l2);
}

function getData(data, l1, l2) {
  if (!isSort) {
    tablename = data;
    setActiveButton(data);
    $.getJSON("http://127.0.0.1:5000/api/" + data, function (result) {
      totalNum = result.length;
      $.getJSON(
        "http://127.0.0.1:5000/api/" + data + "?limit1=" + l1 + "&limit2=" + l2,
        function (result) {
          makeTable(result, l1, l2);
        }
      );
    });
  } else {
    buildLink(l1, l2);
  }
}

function getHeaders(result) {
  var headers = [];
  $.each(result, function (key, value) {
    headers.push(translateHeader(key)); // Применяем перевод
  });
  return headers;
}

function makeTable(result, l1, l2) {
  isIncremented = false;
  var modalIndex = 0;
  $("#pageHeader").html(translateHeader(tablename.charAt(0).toUpperCase() + tablename.slice(1)) + " кестесі");
  $("#pageContent").css("margin-right", "15px");

  table =
    '<div style="margin-left:5px;" class="row"><div class="col-xl-3 col-md-6 mb-4"><div class="card card-hover border-left-primary shadow h-10 py-2" data-toggle="modal" data-target="#addModal" style="cursor: pointer;"><div class="card-body"><div class="row no-gutters align-items-center"><div class="col mr-2"><div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Қосу</div><div class="h5 mb-0 font-weight-bold text-gray-800">Жаңа жазба жасау</div></div><div class="col-auto"><i class="fas fa-plus fa-2x text-gray-300"></i></div></div></div></div></div>';

  table +=
    '<div class="col-xl-3 col-md-6 mb-4"><div class="card border-left-success shadow h-10 py-2"><div class="card-body"><div class="row no-gutters align-items-center"><div class="col mr-2"><div class="text-xs font-weight-bold text-success text-uppercase mb-1">Саны: ' +
    translateHeader(tablename.charAt(0).toUpperCase() + tablename.slice(1)) +
    '</div><div class="h5 mb-0 font-weight-bold text-gray-800">' +
    totalNum +
    '</div></div><div class="col-auto"><i class="fas fa-warehouse fa-2x text-gray-300"></i></div></div></div></div></div>';

  if (tablename == "jobs") {
    table +=
      '<div class="col-xl-3 col-md-6 mb-4"><div class="card border-left-info shadow h-10 py-2" style="height:103px;"><div class="card-body"><div class="row no-gutters align-items-center"><div class="col mr-2"><div class="text-xs font-weight-bold text-info text-uppercase mb-1">Кестені сұрыптау</div><div class="h5 mb-0 font-weight-bold text-gray-800"><div class="form-group"><select id="selectSortOption" class="form-control" data-role="select-dropdown" data-profile="minimal" onchange="newPageSort(10,0);"><option ' +
      sortSelected[0] +
      'value="pending">Күтуде</option><option ' +
      sortSelected[1] +
      ' value="delivered">Жеткізілді</option><option ' +
      sortSelected[2] +
      ' value="all"><b>Барлығы</b></option></select></div></div></div><div class="col-auto" style="top:-14px;"><i class="fas fa-sort fa-2x text-gray-300"></i></div></div></div></div></div>';
  }
  table += "</div>";
  table +=
    '<p style="margin-left:18px;">Кесте жазбадағы барлық мәндерді көрсетпейді. Олардың барлығын көру және жаңартуларды орындау үшін жазбаны басыңыз.</p>';

  table +=
    '<div style="width:auto;margin:18px;" class="card border-left-warning shadow"><table class="table table-hover"><thead><tr>';
  
  // Получаем переведенные заголовки
  var headers = getHeaders(result[0]);
  var modals = makeModals(result);
  var picModals = "";

  var i = 0;
  for (var header in headers) {
    if (i < 8) {
      table += '<th scope="col">' + headers[header] + "</th>";
      i++;
    }
  }
  table += "</tr></thead><tbody>";

  var picId = 1;
  $.each(result, function (key, value) {
    table += "<tr>";
    i = 0;
    for (var index in value) {
      if (i < 8) {
        var t = "" + value[index];
        if (
          t.toLowerCase().includes(".jpg") ||
          t.toLowerCase().includes(".png") ||
          t.toLowerCase().includes(".gif")
        ) {
          table +=
            '<td><a style="margin-left:5px;height:30px;cursor:pointer;" data-toggle="modal" data-target="#modalPic' +
            picId +
            '" class="text-primary"><i class="fas fa-camera"></i> Суретті көру</a></td>';

          picModals +=
            '<div class="modal fade" id="modalPic' +
            picId +
            '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h4 class="modal-title" id="myModalLabel">Сурет</h4><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><a href="' +
            value[index] +
            '" target="_blank"><img style="display:block;width:90%;margin:auto;" src="' +
            value[index] +
            '" /></a></div><div class="modal-footer"><button type="button" class="btn btn-dark" data-dismiss="modal">Жабу</button></div></div></div></div>';
          picId++;
        } else {
          table +=
            '<td data-toggle="modal" data-target="#modal' +
            modalIndex +
            '" style="cursor: pointer;">' +
            value[index] +
            "</td>";
        }
        i++;
      }
    }
    table += "</tr>";
    modalIndex++;
  });

  table += "</tbody></table></div>";
  table = table.replace(/null/g, "");
  
  // Остальная часть функции остается без изменений...
  var totalPages = Math.ceil(totalNum / 10);
  if (l2 == 0) {
    if (result.length < 10) {
      table +=
        '<footer><div><div><h3 style="cursor:default;" class="d-inline"><span class="badge badge-secondary"><i class="fas fa-angle-left"></i></span></h3>';
      table +=
        '&nbsp;<h3 style="cursor:default;" class="d-inline"><span class="badge badge-secondary"><i class="fas fa-angle-right"></i></span></h3><div style="width:150px;">Бет ' +
        currentPage +
        "/" +
        totalPages +
        "</div></div></div></footer>";
    } else {
      table +=
        '<footer><div><div><h3 style="cursor:default;" class="d-inline"><span class="badge badge-secondary"><i class="fas fa-angle-left"></i></span></h3>';
      l2 += 10;
      table +=
        '&nbsp;<h3 class="d-inline" onclick="getData(\'' +
        tablename +
        "'," +
        l1 +
        "," +
        l2 +
        ');changePageNum(true);"><span class="badge badge-primary"><i class="fas fa-angle-right"></i></span></h3><div style="width:150px;">Бет ' +
        currentPage +
        "/" +
        totalPages +
        "</div></div></div></footer>";
    }
  } else {
    if (result.length < 10) {
      l2 -= 10;
      table +=
        '<footer><div><div><h3 class="d-inline" onclick="getData(\'' +
        tablename +
        "'," +
        l1 +
        "," +
        l2 +
        ');changePageNum(false);"><span class="badge badge-primary"><i class="fas fa-angle-left"></i></span></h3>';
      table +=
        '&nbsp;<h3 style="cursor:default;" class="d-inline"><span class="badge badge-secondary"><i class="fas fa-angle-right"></i></span></h3><div style="width:150px;">Бет ' +
        currentPage +
        "/" +
        totalPages +
        "</div></div></div></footer>";
    } else {
      l2 -= 10;
      table +=
        '<footer><div><div><h3 class="d-inline" onclick="getData(\'' +
        tablename +
        "'," +
        l1 +
        "," +
        l2 +
        ');changePageNum(false);"><span class="badge badge-primary"><i class="fas fa-angle-left"></i></span></h3>';
      l2 += 20;
      table +=
        '&nbsp;<h3 class="d-inline" onclick="getData(\'' +
        tablename +
        "'," +
        l1 +
        "," +
        l2 +
        ');changePageNum(true);"><span class="badge badge-primary"><i class="fas fa-angle-right"></i></span></h3><div style="width:150px;">Бет ' +
        currentPage +
        "/" +
        totalPages +
        "</div></div></div></footer>";
    }
  }

  $("#pageContent").html(table);
  $("#modals").html(modals + picModals);
}

function makeModals(result) {
  var modal = "";
  var modalIndex = 0;
  var elemId;

  $.each(result, function (key, value) {
    modal +=
      '<div class="modal fade" id="modal' +
      modalIndex +
      '" tabindex="-1" role="dialog" aria-hidden="true">';
    modal += '<div class="modal-dialog modal-xl" role="document">';
    modal += '<div class="modal-content">';
    modal += '<div class="modal-header">';
    modal += '<h5 class="modal-title">Жазбаны жаңарту</h5>';
    modal +=
      '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    modal += "</div>";
    modal += '<div class="modal-body"><form name="form' + modalIndex + '">';

    var oddCheck = 0;
    first_iteration = true;
    for (var index in value) {
      if (first_iteration) {
        elemId = value[index];
        first_iteration = false;
        modal +=
          '<input type="hidden" id="elemId' +
          modalIndex +
          '" value="' +
          elemId +
          '">';
      } else {
        var disabled = "";
        if (
          index.toLowerCase().includes("datecreated") ||
          index.toLowerCase().includes("lastconnected")
        ) {
          disabled = 'disabled="disabled"';
        }

        var translatedLabel = translateHeader(index);

        if (oddCheck % 2 == 1) {
          if (
            index.toLowerCase().includes("date") ||
            index.toLowerCase().includes("lastconnected")
          ) {
            modal +=
              '<div class="row"><div class="col-sm"><label>' +
              translatedLabel +
              '</label></div><div class="col-sm"><div id="date" class="input-group date"><input type="text" ' +
              disabled +
              ' class="form-control datepicker_recurring_start" name="' +
              index +
              '" value="' +
              value[index] +
              ' "/><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div>';
          } else {
            modal +=
              '<div class="row"><div class="col-sm"><label>' +
              translatedLabel +
              '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
              index +
              '" value="' +
              value[index] +
              '" /></div>';
          }
        } else {
          if (
            index.toLowerCase().includes("date") ||
            index.toLowerCase().includes("lastconnected")
          ) {
            modal +=
              '<div class="col-sm"><label>' +
              translatedLabel +
              '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
              disabled +
              ' class="form-control datepicker_recurring_start" name="' +
              index +
              '" value="' +
              value[index] +
              ' "/><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div></div><br>';
          } else {
            modal +=
              '<div class="col-sm"><label>' +
              translatedLabel +
              '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
              index +
              '" value="' +
              value[index] +
              '" /></div></div><br>';
          }
        }
      }
      oddCheck++;
    }
    oddCheck--;
    if (oddCheck % 2 != 0) {
      modal += '<div class="col-sm"></div><div class="col-sm"></div></div>';
    }

    modal +=
      '</form></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Жабу</button><button type="button" class="btn btn-danger" data-toggle="modal" onclick="getRowId(\'elemId' +
      modalIndex +
      '\');" data-target="#deleteModal" data-dismiss="modal">Жою</button><button type="button" class="btn btn-primary" data-dismiss="modal" onclick="updateRecord(' +
      modalIndex +
      "," +
      elemId +
      ",'" +
      tablename +
      "');\">Өзгерістерді сақтау</button></div></div></div></div>";
    modalIndex++;
  });

  var headers = [];
  $.each(result[0], function (key, value) {
    headers.push(key);
  });

  modal +=
    '<div class="modal fade" id="addModal" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog modal-xl" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Жаңа жазба жасау</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><form name="createForm" id="createForm">';

  var first_iteration = true;
  var oddCheck = 0;
  for (var header in headers) {
    if (first_iteration) {
      first_iteration = false;
    } else {
      var disabled = "";
      if (
        headers[header].toLowerCase().includes("datecreated") ||
        headers[header].toLowerCase().includes("lastconnected")
      ) {
        disabled = 'disabled="disabled"';
      }

      var translatedLabel = translateHeader(headers[header]);

      if (oddCheck % 2 == 1) {
        if (
          headers[header].toLowerCase().includes("date") ||
          headers[header].toLowerCase().includes("lastconnected")
        ) {
          modal +=
            '<div class="row"><div class="col-sm"><label>' +
            translatedLabel +
            '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
            disabled +
            ' class="form-control datepicker_recurring_start" name="' +
            headers[header] +
            '" /><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div>';
        } else {
          modal +=
            '<div class="row"><div class="col-sm"><label>' +
            translatedLabel +
            '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
            headers[header] +
            '" /></div>';
        }
      } else {
        if (
          headers[header].toLowerCase().includes("date") ||
          headers[header].toLowerCase().includes("lastconnected")
        ) {
          modal +=
            '<div class="col-sm"><label>' +
            translatedLabel +
            '</label></div><div class="col-sm"><div id="date" class="input-group"><input type="text" ' +
            disabled +
            ' class="form-control datepicker_recurring_start" name="' +
            headers[header] +
            '" /><div class="input-group-append"><span class="input-group-text" id="basic-addon2"><i class="fas fa-calendar-alt"></i></span></div></div></div></div><br>';
        } else {
          modal +=
            '<div class="col-sm"><label>' +
            translatedLabel +
            '</label></div><div class="col-sm"><input class="form-control" type="text" name="' +
            headers[header] +
            '" /></div></div><br>';
        }
      }
    }
    oddCheck++;
  }
  oddCheck--;
  if (oddCheck % 2 != 0) {
    modal += '<div class="col-sm"></div><div class="col-sm"></div></div>';
  }

  modal +=
    '</form></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Жабу</button><button type="button" class="btn btn-primary" data-dismiss="modal" onclick="createRecord(\'' +
    tablename +
    "');\">Жаңа жазба жасау</button></div></div></div></div>";

  modal +=
    '<div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Жазбаны жою</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><p>Бұл жазбаны шынымен жойғыңыз келе ме?<br>Бұл әрекетті қайтаруға болмайды.</p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Жабу</button><button type="button" class="btn btn-danger" data-dismiss="modal" onclick="deleteRecord(\'' +
    tablename +
    "');\">Жою</button></div></div></div></div>";

  modal = modal.replace(/null/g, "");
  return modal;
}

function updateRecord(formId, elemId, table) {
  $("form:eq(" + formId + ") *")
    .filter(":input")
    .each(function () {
      if (this.value == "") {
        this.value = "None";
      }
      if (this.value == " ") {
        this.value = "None";
      }
    });
  var str = $("form:eq(" + formId + ")").serialize();
  str = str.replace(/null/g, "None");
  str = str.replace(/\s/g, "None");
  console.log(str);
  $.ajax({
    method: "PUT",
    url: "http://127.0.0.1:5000/api/" + table + "/" + elemId + "?" + str,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function deleteRecord(table) {
  $.ajax({
    method: "DELETE",
    url: "http://127.0.0.1:5000/api/" + table + "/" + elemId,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function createRecord(table) {
  $('form[name="createForm"] *')
    .filter(":input")
    .each(function () {
      if (this.value == "") {
        this.value = "None";
      }
    });
  var str = $('form[name="createForm"]').serialize();
  str = str.replace(/null/g, "None");
  str = str.replace(/\s/g, "None");
  $.ajax({
    method: "POST",
    url: "http://127.0.0.1:5000/api/" + table + "?" + str,
    success: function (dat) {
      getData(table, 10, 0);
    },
  });
}

function getRowId(elemModal) {
  elemId = $("#" + elemModal).val();
}

function setActiveButton(id) {
  $(".nav-item").removeClass("active");
  $("#nav-" + id).addClass("active");
}

function changePassword() {
  var oldpas = $("#oldPassword").val();
  var newpas1 = $("#newPassword1").val();
  var newpas2 = $("#newPassword2").val();
  if (newpas1 == newpas2) {
    $.ajax({
      method: "PUT",
      url:
        "http://127.0.0.1:5000/admin/changepassword?oldPassowrd=" +
        oldpas +
        "&newPassword=" +
        newpas1,
      success: function (dat) {
        if (dat.Status == "Error") {
          $("#changePasswordMessage").text(dat.Message);
          $("#oldPassword").val("");
          $("#newPassword1").val("");
          $("#newPassword2").val("");
        } else {
          $("#changePasswordModal").modal("toggle");
          alert(dat.Message);
          $("#oldPassword").val("");
          $("#newPassword1").val("");
          $("#newPassword2").val("");
        }
      },
    });
  } else {
    $("#changePasswordMessage").text("New passwords don't match.");
  }
}

function changePageNum(increment) {
  if (!isIncremented) {
    if (increment) {
      isIncremented = true;
      currentPage++;
    } else {
      isIncremented = true;
      currentPage--;
    }
  }
}

function newPageSort(l1, l2) {
  currentPage = 1;
  buildLink(l1, l2);
}

function buildLink(l1, l2) {
  isSort = true;
  var e = document.getElementById("selectSortOption");
  var option = e.options[e.selectedIndex].value;
  if (option == "pending") {
    sortSelected = ["selected", "", ""];
  }
  if (option == "delivered") {
    sortSelected = ["", "selected", ""];
  }
  if (option == "all") {
    sortSelected = ["", "", "selected"];
  }
  if (option == "all") {
    isSort = false;
    getData("jobs", 10, 0);
  } else {
    var link = "jobs/" + option;
    tablename = "jobs";
    setActiveButton("jobs");
    $.getJSON(
      "http://127.0.0.1:5000/api/" + link.toLowerCase(),
      function (result) {
        totalNum = result.length;
        $.getJSON(
          "http://127.0.0.1:5000/api/" +
            link.toLowerCase() +
            "?limit1=" +
            l1 +
            "&limit2=" +
            l2,
          function (result) {
            makeTable(result, l1, l2);
          }
        );
      }
    );
  }
}
