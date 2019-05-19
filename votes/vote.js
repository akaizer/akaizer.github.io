document.getElementById("load").onclick = async function () {
  let url = document.getElementById("url").value;
  console.log(url);
  $.ajax(url, {type: "GET", dataType: "jsonp"}, function (data, status) {
    console.log(data, status);
  })
};