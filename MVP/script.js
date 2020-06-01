
'use strict';


const foursquareVenueURL = 'https://api.foursquare.com/v2/venues/search';
const foursquarePhotonURL = 'https://api.foursquare.com/v2/venues/';
const googleURL = 'https://maps.googleapis.com/maps/api/streetview';

// google apikey
const key = 'AIzaSyDal57aUyQAAoSUb82ptXKbH1X4M-iYu8I';

// foursquare client information
const client_id = 'K3JLT3HH0JYERCWAZQYHLHKFMX4JFM5VQ4FXUOOLUQIRWPZ2';
const client_secret = 'NKTAY0IR52WOKLSWDY32SR5AYVKG2RAQIEZK3NENASVTAB44';
// foursquare version
const v = '20200514';

// store the results id
const STORE = {};

// search name and category check
let checkBox = false;
let nameBox = false;

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => ( params[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}` : '') )
  return queryItems.join('&');
}

// use the regular expression to split input string
function getTokens(rawString) {
  return rawString.toUpperCase().split(/[ ,!.";:-]+/).filter(Boolean);
}

// fetch foursquare venue
function getFour(city, state, radius, query, categoryId, limit) {
  const params = {
    near:  `${city}, ${state}`,
    radius: radius,
    query: query,
    client_id: client_id,
    client_secret: client_secret,
    limit: limit,
    v: v,
    categoryId: categoryId
  };
 
  const queryString = formatQueryParams(params)
  // build the complete url
  const url = foursquareVenueURL + '?' + queryString;
  console.log(url);

  // clear error message
  $('#js-error-message').text('');

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => storeResponse(responseJson))
    .catch(err => {
      $('.error-message').show();
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function storeResponse(responseJson){
  displayResults(responseJson);
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  $('#results-list').empty();
  // if there is no result
  let resultData = responseJson.response.venues;
  if (resultData.length === 0){
    $('#results-list').append(
      `<li><h3>No results found</h3></li>`);
  }
  
  for (let i = 0; i < resultData.length; i++){
    let addressObject = resultData[i].location.formattedAddress.join('');
    let listId = cuid(); 
    // store each result list id as a new object, the value includes latitude and longitude
    STORE[`${listId}`]= new Object();
    Object.assign(STORE[`${listId}`], {"lat": resultData[i].location.lat, "lng": resultData[i].location.lng});
    // append the result name, category (if exists) and address into the result list
    $('#results-list').append(
      `<li id="num-${listId}"><h3>${resultData[i].name}</h3> 
      ${resultData[i].categories.length ? `<p><strong>${resultData[i].categories[0].name}</strong></p>` : ''}
      <p>Location: ${addressObject ? `${addressObject}` : 'no'}</p>
      </li>`
    )
    // append the result image into the result list
    getImage(resultData[i].id, listId)
  };
    
  // //display the results section  
  $('#results').removeClass('hidden');
};


function getImage(venueId, listId){
  const params = {
    client_id: client_id,
    client_secret: client_secret,
    v: v,
  };

  const queryString = formatQueryParams(params)
  // build the complete url
  const url = foursquarePhotonURL + venueId + '/photos' + '?' + queryString;
  // console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => imageRequest(responseJson.response.photos, listId))
    
    .catch(err => {
      $('.error-message').show();
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function imageRequest(photoResponse, listId){
  
  let photoItem = photoResponse.items[0]
  // if the result image can be fetched from Foursquare
  if (photoItem){
    const imageSrc = photoItem.prefix + `${photoItem.width}x${photoItem.height}` + photoItem.suffix;
    $(`#num-${listId}`).append(`<img src='${imageSrc}' alt="error">`)
  }
  // Else, fetch the result image from Google Static Street View 
  else{
    const imageSize = '400x300';
    const params = {
      size: imageSize,
      location: `${STORE[listId].lat},${STORE[listId].lng}`,
      key: key,
    };
    const  queryString = formatQueryParams(params);
    const  url = googleURL + '?' + queryString;
    $(`#num-${listId}`).append(`<img src='${url}' alt="error">`)
  }
  
}

// submit the search params
function getVenue(){
  $('form').submit(function(event) {
    event.preventDefault();
    let categoryId  = [];
    // get all selected categories 
    $('.category-group :checkbox:checked').each(function(i){
      categoryId[i] = $(this).val();
    });
    // get other params
   let city = $('#city').val(), state = $('#state').val(), 
   radius = $('#radius').val() ,query = $('#name').val(),
   limit = $('#limit').val();
  //  transform the mile to meter (Foursqure request the meter as distance unit)
   radius = radius * 1609.344;
  //  hide error message
   $('.error-message').hide()
   getFour(city, state, radius, query, categoryId, limit);
  })
}

// category checkbox real-time inspection
function selectChange(){
  $('.category-group').on('change',function(){
    let selectCheck = false;
    // once a category is selected set selectCheck to be true
    $('.category-group :checkbox:checked').each(function(i){
      selectCheck = true;
    });
    if (selectCheck){
      checkBox = true
    }
    else{
      checkBox = false
    }
    // only when search name is input or at least one category is selected, show the search radius option 
    if (nameBox || checkBox){
      $('.radius-group').show()
    }
    else{
      $('.radius-group').hide()
    }
  });

}

// search name input real-time inspection
function nameChange(){
  $('#name').keyup(function(){
    if ($('#name').val()){
      nameBox = true
    }
    else{
      nameBox= false
    }
    // only when search name is input or at least one category is selected, show the search radius option 
    if (nameBox || checkBox){
      $('.radius-group').show()
    }
    else{
      $('.radius-group').hide()
    }
  }
  )
 
}

function getChange(){
  selectChange() 
  nameChange()
}

// main function
function mainFunc(){
  getVenue();
  getChange();
}

$(mainFunc);

