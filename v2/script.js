
'use strict';


const searchURL = 'https://api.foursquare.com/v2/venues/search';
const googleURL = 'https://maps.googleapis.com/maps/api/streetview';

const key = 'AIzaSyDal57aUyQAAoSUb82ptXKbH1X4M-iYu8I';

const client_id = 'K3JLT3HH0JYERCWAZQYHLHKFMX4JFM5VQ4FXUOOLUQIRWPZ2';
const client_secret = 'NKTAY0IR52WOKLSWDY32SR5AYVKG2RAQIEZK3NENASVTAB44';
const v = '20200514';

const STORE = {};

let checkBox = false;
  let nameBox = false;

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => ( params[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}` : '') )
  return queryItems.join('&');
}

function getTokens(rawString) {
  return rawString.toUpperCase().split(/[ ,!.";:-]+/).filter(Boolean);
}


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
  const url = searchURL + '?' + queryString;
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
    // console.log('fail')
    $('#results-list').append(
      `<li><h3>No results found</h3></li>`);
  }
  const imageSize = '400x300'
  let params = {
    size: imageSize,
    location: '',
    key: key,
  };
 
  
  let queryString;
  
  let url;
  // iterate through the items array
  for (let i = 0; i < resultData.length; i++){
    params.location = `${resultData[i].location.lat},${resultData[i ].location.lng}`;
    queryString = formatQueryParams(params);
    url = googleURL + '?' + queryString;
   
    let addressObject = resultData[i].location.formattedAddress.join('');
    let listId = cuid(); 
    STORE[`${listId}`]= new Object();
    Object.assign(STORE[`${listId}`], {"lat": resultData[i].location.lat, "lng": resultData[i].location.lng});
  
    $('#results-list').append(
      `<li id="num-${listId}"><h3>${resultData[i].name}</h3>
      ${resultData[i].categories.length ? `<p>${resultData[i].categories[0].name}</p>` : ''}
      <p>Location: ${addressObject ? `${addressObject}` : 'no'}</p>
      </li>`
    )
    // getImage(resultData[i].id, listId)
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
  const url = 'https://api.foursquare.com/v2/venues/' + venueId + '/photos' + '?' + queryString;
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
  if (photoItem){
    const imageSrc = photoItem.prefix + `${photoItem.width}x${photoItem.height}` + photoItem.suffix;
    $(`#num-${listId}`).append(`<img src='${imageSrc}' alt="error">`)
  }
  
  
}

function getVenue(){
  $('form').submit(function(event) {
    event.preventDefault();
    let categoryId  = [];
    $('.category-group :checkbox:checked').each(function(i){
      categoryId[i] = $(this).val();
    });
   let city = $('#city').val(), state = $('#state').val(), 
   radius = $('#radius').val() ,query = $('#name').val(),
   limit = $('#limit').val();
   console.log(query)
   getFour(city, state, radius, query, categoryId, limit);
  })
}

function selectChange(){
 
  $('.category-group').on('change',function(){
    let selectCheck = false;
    $('.category-group :checkbox:checked').each(function(i){
      selectCheck = true;
    });
    if (selectCheck){
      checkBox = true
    }
    else{
      checkBox = false
    }
    if (nameBox || checkBox){
      $('.radius-group').show()
    }
    else{
      $('.radius-group').hide()
    }
  });

}

function nameChange(){
  $('#name').keyup(function(){
    if ($('#name').val()){
      nameBox = true
    }
    else{
      nameBox= false
    }
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


function mainFunc(){
  getVenue();
  getChange();
 
}

$(mainFunc);

