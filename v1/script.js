
'use strict';


const searchURL = 'https://api.foursquare.com/v2/venues/search';
// const searchURL = 'https://api.foursquare.com/v2/venues/categories'
const apiKey = 'x9X8Jp1S0wfCS3ed0YRcqoaXIqeTOlxqEOyGLC3n';
// const near = 'Chicago, IL';
const client_id = 'K3JLT3HH0JYERCWAZQYHLHKFMX4JFM5VQ4FXUOOLUQIRWPZ2';
const client_secret = 'NKTAY0IR52WOKLSWDY32SR5AYVKG2RAQIEZK3NENASVTAB44';
const v = '20200514';
// const query = 'steak';


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => ( params[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}` : '') )
  return queryItems.join('&');
}

function getTokens(rawString) {
  return rawString.toUpperCase().split(/[ ,!.";:-]+/).filter(Boolean);
}

function displayResults(responseJson) {
  // if there are previous results, remove them
  console.log(responseJson);
  $('#results-list').empty();
  // if there is no result
  if (responseJson.data.length === 0){
    $('#results-list').append(
      `<li><h3>No results found</h3></li>`);
  }
  // iterate through the items array
  for (let i = 0; i < responseJson.data.length; i++){
    
    let addressObject = responseJson.data[i].addresses[0];
    $('#results-list').append(
      `<li><h3>${responseJson.data[i].fullName}</h3>
      <p>${responseJson.data[i].description}</p>
      <p><a href="${responseJson.data[i].url}" target="_blank">More information</a></p>
      <p>Location: ${addressObject.line1}, ${addressObject.line2 ? `${addressObject.line2} ,` : ''}${addressObject.city}, ${addressObject.stateCode}  ${addressObject.postalCode}</p>
      <img src='${responseJson.data[i].images[0].url}' alt='${responseJson.data[i].fullName}'>
      </li>`
    )};
  //display the results section  
  $('#results').removeClass('hidden');
};


function getFour(city,state,radius,query,categoryId) {
  const params = {
    near:  `${city}, ${state}`,
    radius: radius,
    query: query,
    client_id: client_id,
    client_secret: client_secret,
    
    v: v,
    categoryId: categoryId
    // query: query,
    // radius: 6000,
    // limit: 20
  };
  if (!params.radius){
    console.log('radius type')
  }
  
  const queryString = formatQueryParams(params)
  // build the complete url
  const url = searchURL + '?' + queryString;
  console.log(url);

  const options = {
    // the apiKey in the header will be blocked by CORS policy
    headers: new Headers(
      // {"X-Api-Key": apiKey}
      )
  };
  // clear error message
  $('#js-error-message').text('');

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => console.log(responseJson))
    // .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function storeResponse(responseJson){
  console.log(responseJson.response.venues)
  // console.log(responseJson.response.venues[0])
  let cateId = responseJson.response.venues[0].id;


  const params = {
    client_id: client_id,
    client_secret: client_secret,
    v: v,
  };

  const queryString = formatQueryParams(params)
  // build the complete url
  const url = 'https://api.foursquare.com/v2/venues/' + cateId + '/photos' + '?' + queryString;
  // console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => imageRequest(responseJson.response.photos.items[0]))
    
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });

  

}

function imageRequest(photoItem){
  console.log(photoItem.prefix);
  console.log(photoItem.suffix);
  const imageSrc = photoItem.prefix + `${photoItem.width}x${photoItem.height}` + photoItem.suffix;
  console.log (imageSrc)
  $('img').attr('src',imageSrc );
  $('img').attr('alt','gege')
}

function watchForm() {
  // getFour();
  $('.start').on('click', event => {
    event.preventDefault();
    getFour();
  })
  // $('form').submit(event => {
  //   event.preventDefault();
  //   // use regular expression to split searchTerm and set searchTerm to be uppercase
  //   const searchTerm = $('#js-search-term').val().toUpperCase().split(/[ ,!.";:-]+/);
  //   console.log(searchTerm)
  //   const maxResults = $('#js-max-results').val();
    
  // });
}


function selectionList(){
  $('form').submit(function(event) {
    event.preventDefault();
    let categoryId  = [];
    $('.category-group :checkbox:checked').each(function(i){
      categoryId[i] = $(this).val();
    });
   console.log('categoryid', categoryId)
   let city = $('#city').val(), state = $('#state').val(), 
   radius = $('#radius').val() ,query = $('#name').val() ;
   console.log('city',city,'state',state,'radius',radius,'query', query);
   getFour(city,state,radius,query,categoryId);
  })
}


function getCategory(){
  const url = 'https://api.foursquare.com/v2/venues/categories?client_id=K3JLT3HH0JYERCWAZQYHLHKFMX4JFM5VQ4FXUOOLUQIRWPZ2&client_secret=NKTAY0IR52WOKLSWDY32SR5AYVKG2RAQIEZK3NENASVTAB44&v=20200514';
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => console.log(responseJson))
    
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

let checkBox = false;
let nameBox = false;

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
  watchForm();
  selectionList();
  getChange();
  nameChange()
  // getCategory();
}

$(mainFunc);

