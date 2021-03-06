"use strict";

/* READ IN LOCAL JSON AS ARRAY */
fetch("/resources/json/DocsJSON.json")
  .then(res => res.json())
  .then(data => {
    writeData(data);
    makeDataTable(data);
    makeSearch();
  });

let data;
const writeData = source => {
  data = source;
};

/* LOCAL JSON TABLE */
const makeDataTable = data => {
  let html = '<table class="table is-striped">';
  html += "<tr>";
  const headers = ["Year", "Author", "Title", "Tags", ""];
  headers.forEach(header => {
    return (html += `<th>${header}</th>`);
  });
  html += "</tr>";
  let thing = 1;
  data.forEach(doc => {
    const tableRow = `<tr id="${doc.FID}">
      <td>${doc.Year}</td>
      <td>${doc.Author}</td>
      <td>${doc.Title}</td>
      <td>${Object.keys(doc.contentTags).map(key => {
        return ` ${doc.contentTags[key]}`;
      })}</td>
      <td><button class="button is-link is-outlined is-small" onclick="addDoc(${
        doc.FID
      })">Add to cart</button></td>
      </tr>`;
    return (html += tableRow);
  });
  html += "</table>";
  document.querySelector("div#clicky").innerHTML = html;
};

/* SHOPPING CART */
let docsInCart = [];

function addDoc(x) {
  data.forEach(doc => {
    if (x == doc.FID) {
      if (docsInCart && docsInCart.length) {
        var found = false;

        for (let i = 0; i < docsInCart.length; i++) {
          if (docsInCart[i].FID == doc.FID) {
            found = true;
            break;
          }
        }

        if (found == false) {
          docsInCart.push(doc);
        } else {
        }
      } else {
        docsInCart.push(doc);
      }
    }
  });
  makeCartTable();
}

function removeDoc(x) {
  let docIndex;

  docsInCart.forEach(doc => {
    if (x == doc.FID) {
      docIndex = docsInCart.indexOf(doc);
    }
  });

  docsInCart.splice(docIndex, 1);
  makeCartTable();
}

function makeCartTable() {
  let html = '<table class="table is-striped">';
  html += "<tr>";
  const headers = ["Year", "Author", "Title", "Tags", ""];
  headers.forEach(header => {
    return (html += `<th>${header}</th>`);
  });
  html += "</tr>";
  docsInCart.forEach(doc => {
    const tableRow = `<tr id="${doc.FID}">
    <td>${doc.Year}</td>
    <td>${doc.Author}</td>
    <td>${doc.Title}</td>
    <td>${doc.contentTags}</td>
    <td><button class="button is-danger is-outlined is-small" onclick="removeDoc(${doc.FID})">Remove from cart</button></td>
    </tr>`;
    return (html += tableRow);
  });
  html += "</table>";
  document.querySelector("div#cart").innerHTML = html;
}

/* FUSE SEARCH */
let fuse;

const makeSearch = () => {
  fuse = new Fuse(data, options);
};

let options = {
  shouldSort: true,
  threshold: 0.5,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["Title", "Author"]
};

/* FUSE SEARCH RESULTS */

function fusesearch() {
  let fusefield = document.querySelector("#fusefield");
  let result = fuse.search(fusefield.value);
  if (result.length == 0) {
    var html = "No search results found.";
  } else {
    var html = `<p>Your search returned ${result.length} results.</p><table class="table is-striped">`;
    html += "<tr>";
    var flag = 0;
    var headers = ["Year", "Author", "Title", "Tags", ""];
    headers.forEach(header => {
      return (html += `<th>${header}</th>`);
    });
    html += "</tr>";
    result.forEach(doc => {
      const tableRow = `<tr id="${doc.FID}">
      <td>${doc.Year}</td>
      <td>${doc.Author}</td>
      <td>${doc.Title}</td>
      <td>${doc.contentTags}</td>
      <td><button class="button is-link is-outlined is-small" onclick="addDoc(${doc.FID})">Add to cart</button></td>
      </tr>`;
      return (html += tableRow);
    });
    html += "</table>";
  }
  document.querySelector("div#search").innerHTML = html;
}

/* FORM SUBMISSION */

let fullRequest = {}; // This is the final form object

function wrapDocs() {
  let docs = [];
  for (let i = 0; i < docsInCart.length; i++) {
    docs.push(docsInCart[i]);
  }

  return docs;
}

function getInputs(form) {
  let obj = {};
  let elements = form.querySelectorAll("input, select, textarea");
  for (let i = 0; i < elements.length; ++i) {
    let element = elements[i];
    let name = element.name;
    let value = element.value;

    if (name) {
      obj[name] = value;
    }
  }
  return obj;
}

/* LISTENER FOR CLICKING SUBMIT BUTTON */

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("requestForm");
  const output = document.getElementById("output");

  form.addEventListener(
    "submit",
    function(e) {
      e.preventDefault();
      let user = getInputs(this);
      let docs = wrapDocs();
      fullRequest["user"] = user;
      fullRequest["documents"] = docs;
      output.innerHTML = JSON.stringify(fullRequest);

      let tmp = JSON.stringify(fullRequest);
      let formData = new FormData();
      formData.append("request", tmp);

      fetch("/test.php", { method: "POST", body: formData })
        .then(function(response) {
          return response.text();
        })
        .then(function(body) {
          console.log(body);
        });
    },
    false
  );
});
