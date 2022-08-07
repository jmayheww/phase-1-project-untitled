// -------------------------------------------VARIABLES-------------------------

const rootURL = "https://api.teleport.org/api";

const ISO_Map = {
  Africa: "AF",
  Antarctica: "AN",
  Asia: "AS",
  Europe: "EU",
  "North America": "NA",
  Oceania: "OC",
  "South America": "SA",
};

// -----------------------------------------DOM-VARIABLES----------------------------

const continentWrapper = document.querySelector("#continent-wrapper");
const countryWrapper = document.querySelector("#country-wrapper");
const cityWrapper = document.querySelector("#city-wrapper");
const cardWrapper = document.querySelector("#city-card-wrapper");

const continentDropDown = document.querySelector("#continents");
const countryDropDown = document.querySelector("#countries");
const cityDropDown = document.querySelector("#cities");

const DOM_MAP = {
  continent: {
    wrap: continentWrapper,
    drop: continentDropDown,
  },
  country: {
    wrap: countryWrapper,
    drop: countryDropDown,
  },
  city: {
    wrap: cityWrapper,
    drop: cityDropDown,
  },
  details: {
    wrap: cardWrapper,
  },
};

// -------------------------------------------API---------------------------------------------------

const getAPIURL = {
  continent: () => `${rootURL}/continents`,

  country: (continent) =>
    `${rootURL}/continents/geonames:${ISO_Map[continent]}/countries`,

  city: (country) =>
    `${rootURL}/cities?search=${country}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity`,

  details: (city) =>
    `${rootURL}/cities/?search=${city}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity%3Aurban_area%2Fua%3Ascores`,
};

function getAPIData(URL) {
  return fetch(URL).then((resp) => resp.json());
}

const parseAPIData = {
  continent: (data) =>
    data["_links"]["continent:items"].map((location) => location.name),
  country: (data) =>
    data["_links"]["country:items"].map((location) => location.name),
  city: (data) =>
    data["_embedded"]["city:search-results"].map((location) => {
      return location["_embedded"]["city:item"].name;
    }),
  details: (data) => {
    console.log("data: ", data);

    return data["_embedded"]["city:search-results"][0]["_embedded"][
      "city:item"
    ];
  },
};

// DOM MANPIPULATION -------------------------------------------------------

function createAppendOptions(optList, parentEl) {
  optList.forEach((opt) => {
    const option = document.createElement("option");
    option.innerText = opt;
    parentEl.append(option);
  });
}

function resetDropDownOptions(dropdown) {
  const defaultOption = dropdown.children[0];

  defaultOption.selected = true;
  dropdown.innerHTML = "";
  dropdown.append(defaultOption);
}

function renderLocationData(list, dropDown) {
  if (list.length < 1) {
    list = ["No cities in this country..."];
  }

  dropDown.parentElement.classList.remove("hide");
  createAppendOptions(list, dropDown);
}

function createCityCard(data, location) {
  const h2 = document.createElement("h2");
  const description = document.createElement("p");
  const population = document.createElement("p");

  population.innerText = data.population;

  location.append(h2, description, population);
}

function dropDownEventHandler(locationType, event) {
  let selection = event ? event.target.value : null;

  if (selection === "United States") {
    selection = "usa";
  }

  const url = selection
    ? getAPIURL[locationType](selection)
    : getAPIURL[locationType]();

  getAPIData(url)
    .then((data) => {
      const locList = parseAPIData[locationType](data).sort();

      if (event) {
        resetDropDownOptions(DOM_MAP[locationType].drop);
      }
      renderLocationData(locList, DOM_MAP[locationType].drop);
    })
    .catch((err) => {
      console.log(`Error fetching ${locationType} list: `, err);
    });
}

function handleCityCards(locationType, event) {
  let selection = event.target.value;

  const url = getAPIURL[locationType](selection);

  getAPIData(url).then((data) => {
    const detailsList = parseAPIData[locationType](data);
    createCityCard(detailsList, DOM_MAP[locationType].wrap);
  });
}

// EVENT LISTENERS ----------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  dropDownEventHandler("continent");
});

continentDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("country", event);
});

countryDropDown.addEventListener("change", (event) => {
  dropDownEventHandler("city", event);
});

cityDropDown.addEventListener("change", (event) => {
  handleCityCards("details", event);

  // const selection = event.target.value;

  // const cityUrl = getAPIURL["city"](selection);

  // const cityDetails = `https://api.teleport.org/api/cities/?search=${selection}&embed=city%3Asearch-results%2Fcity%3Aitem%2Fcity%3Aurban_area%2Fua%3Ascores`;

  // getAPIData(cityDetails).then((data) => {
  //   console.log(data);
  //   const getPopDetails =
  //     data._embedded["city:search-results"][0]["_embedded"]["city:item"];

  //   const getQualityDetails =
  //     getPopDetails._embedded["city:urban_area"]["_embedded"]["ua:scores"];
  //   console.log(getPopDetails.population);
  //   console.log(getQualityDetails);

  //   if ("city:urban_area" === undefined) {
  //     console.log("This city does not current have quality of life statistics");
  //   }
  // });

  //  "ua:details": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/details/"

  //   "ua:primary-cities": [
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5392171/",
  //         "name": "San Jose"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5391959/",
  //         "name": "San Francisco"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5389489/",
  //         "name": "Sacramento"
  //     },
  //     {
  //         "href": "https://api.teleport.org/api/cities/geonameid:5378538/",
  //         "name": "Oakland"
  // })

  // "ua:salaries": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/salaries/"
  // },
  // "ua:scores": {
  //   "href": "https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/scores/
});
